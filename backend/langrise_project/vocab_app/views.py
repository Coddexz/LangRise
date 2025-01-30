from rest_framework import viewsets, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Word, WordsList
from .serializers import WordSerializer, WordsListSerializer, RegisterSerializer, CurrentUserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from .gen_ai_api import StoryGenerator
from .utils import update_word_repetition, compare_word_similarity, get_grade_based_on_similarity


# Create your views here.
class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        serializer = CurrentUserSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class WordViewSet(viewsets.ModelViewSet):
    serializer_class = WordSerializer
    permission_classes = [IsAuthenticated]
    queryset = Word.objects.all()

    def get_queryset(self):
        words_list_id = self.request.query_params.get('words-list', None)

        if words_list_id is not None:
            try:
                words_list = WordsList.objects.get(id=words_list_id, user=self.request.user)
            except WordsList.DoesNotExist:
                raise NotFound(detail="The requested words list does not exist or you don't have access to it.")

            return Word.objects.filter(words_list=words_list)
        else:
            return Word.objects.filter(words_list__user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        words_list_id = request.query_params.get('words-list', None)
        payload = request.data

        if words_list_id is None:
            raise PermissionDenied('The words_list field is required.')

        try:
            WordsList.objects.get(id=words_list_id, user=user)
        except WordsList.DoesNotExist:
            raise NotFound(detail="The requested words list does not exist or you don't have access to it.")

        with transaction.atomic():

            if 'add' in payload:
                add_data = payload['add']
                if isinstance(add_data, dict):
                    add_data = [add_data]

                data = [{**word, 'words_list': words_list_id} for word in add_data]
                serializer = self.get_serializer(data=data, many=isinstance(data, list))
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)

            if 'update' in payload:
                update_data = payload['update']
                if isinstance(update_data, dict):
                    update_data = [update_data]

                for word in update_data:
                    word_id = word.pop('id', None)
                    word_data = {**word, 'words_list': words_list_id}

                    try:
                        word_obj = Word.objects.get(id=word_id, words_list=words_list_id)
                        serializer = self.get_serializer(word_obj, data=word_data, partial=True)
                        serializer.is_valid(raise_exception=True)
                        self.perform_update(serializer)
                    except Word.DoesNotExist:
                        raise NotFound(detail=f"The requested word word_id={word_id} does not exist or you don't have "
                                              f"access to it.")

            if 'delete' in payload:
                delete_data = payload['delete']
                if isinstance(delete_data, (str, int)):
                    delete_data = [delete_data]

                for word_id in delete_data:
                    try:
                        word_obj = Word.objects.get(id=word_id, words_list=words_list_id)
                        word_obj.delete()
                    except Word.DoesNotExist:
                        raise NotFound(detail="The requested word does not exist or you don't have access to it.")

            return Response({"message": "Changes saved successfully!"}, status=status.HTTP_200_OK)


class WordsListViewSet(viewsets.ModelViewSet):
    serializer_class = WordsListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WordsList.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user.id
        payload = request.data

        if 'name' not in payload:
            raise PermissionDenied('The name field is required.')

        data = {**payload, 'user': user}

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class GenerateStoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Endpoint to generate a story using ChatGPT.
        Accepts `words`, `language_level`, and `tone` in the request payload.
        """
        words = request.data.get('words', None)
        language_level = request.data.get('language_level', 'B1')
        tone = request.data.get('tone', 'Neutral')

        if not words or not isinstance(words, list):
            return Response({'error': "The 'words' field is required and must be a non-empty list."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            generator = StoryGenerator(words=words, language_level=language_level, tone=tone)
            result = generator.generate_story()
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except RuntimeError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(result, status=status.HTTP_200_OK)


class WordsReviewView(APIView):
    permission_classes = [IsAuthenticated]

    GAME_RATING_LIMITS = {
        'write_words': 5,
        'story': 4,
        'match_words': 4,
        'flashcards': 3,
    }

    def post(self, request, *args, **kwargs):
        """
        Endpoint to update words' repetition data based on user performance.

        Expected request body:
        {
            "flashcards": [{ "word_id": 1, "rating": 3 }],
            "story": [{ "word_id": 2, "rating": 4 }],
            "match": [{ "word_id": 3, "rating": 4 }],
            "write_words": [{ "word_id": 4, "typed_word": "example" }]
        }
        """
        updated_words = []
        errors = []

        try:
            if not isinstance(request.data, dict) or not request.data.items() or not any(request.data.values()):
                return Response(
                    {"error": "Invalid request format. Expected a JSON object."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            for game_type, words in request.data.items():
                if game_type not in self.GAME_RATING_LIMITS:
                    errors.append(
                        {"error": f"Invalid game type '{game_type}'. Valid options are:"
                                  f"{', '.join(self.GAME_RATING_LIMITS.keys())}"}
                    )
                    continue

                max_rating = self.GAME_RATING_LIMITS[game_type]

                for word_data in words:
                    word_id = word_data.get("word_id")
                    if not word_id:
                        errors.append({"error": f"Missing 'word_id' in {game_type} game."})
                        continue

                    try:
                        word = Word.objects.get(pk=word_id, words_list__user=request.user)
                    except Word.DoesNotExist:
                        errors.append({"error": f"Word with ID {word_id} not found or does not belong to the user."})
                        continue

                    if game_type == "write_words":
                        typed_word = word_data.get("typed_word")
                        if not typed_word or not isinstance(typed_word, str):
                            errors.append(
                                {"error": f"Invalid or missing 'typed_word' for word_id {word_id} in write_words game."}
                            )
                            continue
                        similarity_score = compare_word_similarity(word.word, typed_word)
                        rating = get_grade_based_on_similarity(similarity_score)
                    else:
                        rating = word_data.get("rating")

                        if rating is None:
                            errors.append({"error": f"Missing 'rating' for word_id {word_id} in {game_type} game."})
                            continue

                        try:
                            rating = int(rating)
                        except ValueError:
                            errors.append({"error": f"Invalid 'rating' for word_id {word_id} in {game_type} game. "
                                                    f"Must be an integer."})
                            continue

                    if not (0 <= rating <= max_rating):
                        errors.append(
                            {"error": f"Invalid rating {rating} for word_id {word_id} in {game_type} game. "
                                      f"Max allowed: {max_rating}."}
                        )
                        continue

                    # Update word repetition using SuperMemo2
                    try:
                        updated_word = update_word_repetition(word, rating)
                        updated_words.append({
                            "word_id": word_id,
                            "next_review": updated_word.next_review
                        })
                    except Exception as e:
                        errors.append({"error": f"Failed to update word_id {word_id}: {str(e)}"})

            # Determine response status
            if errors and updated_words:
                return Response({
                    "message": "Some words updated, but there were errors.",
                    "updated_words": updated_words,
                    "errors": errors
                }, status=status.HTTP_207_MULTI_STATUS)

            elif errors:
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "message": "Words updated successfully.",
                "updated_words": updated_words
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Unexpected server error: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework import viewsets, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from .models import Word, WordsList
from .serializers import WordSerializer, WordsListSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import transaction


# Create your views here.
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
                        raise NotFound(detail="The requested word does not exist or you don't have access to it.")

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

from rest_framework import viewsets
from rest_framework.exceptions import NotFound
from .models import Word, WordsList
from .serializers import WordSerializer, WordsListSerializer
from rest_framework.permissions import IsAuthenticated


# Create your views here.
class WordViewSet(viewsets.ModelViewSet):
    serializer_class = WordSerializer
    permission_classes = [IsAuthenticated]
    queryset = Word.objects.all()

    def get_queryset(self):
        words_list_id = self.request.query_params.get('words-list', None)

        if words_list_id is not None:
            queryset = Word.objects.filter(words_list=words_list_id, words_list__user=self.request.user)
            if queryset.exists():
                return queryset
            else:
                raise NotFound(detail="The requested words list does not exist or you don't have access to it.")
        else:
            return Word.objects.filter(words_list__user=self.request.user)

class WordsListViewSet(viewsets.ModelViewSet):
    serializer_class = WordsListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WordsList.objects.filter(user=self.request.user)

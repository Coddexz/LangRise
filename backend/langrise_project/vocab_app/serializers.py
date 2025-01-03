from rest_framework import serializers
from .models import Word, WordsList

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ['id', 'word', 'translation', 'pronunciation', 'interval', 'last_reviewed', 'words_list']

class WordsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordsList
        fields = ['id', 'name', 'date_created', 'user']
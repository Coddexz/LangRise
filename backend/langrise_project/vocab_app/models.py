from django.db import models
from django.conf import settings


# Create your models here.
class Word(models.Model):
    word = models.CharField(max_length=100)
    translation = models.CharField(max_length=100)
    pronunciation = models.CharField(max_length=100, null=True, blank=True)
    image_data = models.BinaryField(null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    interval = models.IntegerField(default=1)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    words_list = models.ForeignKey('WordsList', on_delete=models.CASCADE)

    def __str__(self):
        return self.word


class WordsList(models.Model):
    name = models.CharField(max_length=100)
    date_created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

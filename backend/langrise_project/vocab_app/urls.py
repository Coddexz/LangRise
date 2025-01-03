from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WordViewSet, WordsListViewSet


router = DefaultRouter()
router.register('words', WordViewSet)
router.register('words-list', WordsListViewSet, basename='words_list')

urlpatterns = [
    path('', include(router.urls)),
]
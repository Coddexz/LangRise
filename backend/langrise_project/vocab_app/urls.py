from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (RegisterViewSet, WordViewSet, WordsListViewSet, GenerateStoryAPIView, CurrentUserAPIView,
                    WordsReviewView)

router = DefaultRouter()
router.register('register', RegisterViewSet , basename='register')
router.register('words', WordViewSet)
router.register('words-lists', WordsListViewSet, basename='words_lists')

urlpatterns = [
    path('', include(router.urls)),
    path('generate-story/', GenerateStoryAPIView.as_view(), name='generate_story'),
    path('current-user/', CurrentUserAPIView.as_view(), name='current_user'),
    path('words-review/', WordsReviewView.as_view(), name='word_review'),
]

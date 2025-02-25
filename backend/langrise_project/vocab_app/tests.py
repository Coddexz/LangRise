from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.test import TestCase
from .models import Word, WordsList
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class AuthenticationTests(APITestCase):
    def setUp(self):
        # Create a test user
        self.username = "testuser"
        self.password = "testpassword"
        self.user = User.objects.create_user(username=self.username, password=self.password)

        # URLs
        self.token_obtain_url = "/api/token/"
        self.token_refresh_url = "/api/token/refresh/"
        self.protected_url = "/api/words-lists/"

    def test_token_obtain_success(self):
        """Test successful token obtain."""
        response = self.client.post(self.token_obtain_url, {
            "username": self.username,
            "password": self.password
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_token_obtain_failure(self):
        """Test token obtain with invalid credentials."""
        response = self.client.post(self.token_obtain_url, {
            "username": self.username,
            "password": "wrongpassword"
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)

    def test_token_refresh_success(self):
        """Test successful token refresh."""
        # Obtain a refresh token
        refresh = RefreshToken.for_user(self.user)

        response = self.client.post(self.token_refresh_url, {
            "refresh": str(refresh)
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_token_refresh_failure(self):
        """Test token refresh with invalid token."""
        response = self.client.post(self.token_refresh_url, {
            "refresh": "invalidtoken"
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)

    def test_access_protected_endpoint_with_valid_token(self):
        """Test accessing a protected endpoint with a valid access token."""
        # Obtain an access token
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        # Include the token in the Authorization header
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Simulate a GET request to a protected endpoint
        response = self.client.get(self.protected_url)

        # Assert access is granted
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_access_protected_endpoint_with_invalid_token(self):
        """Test accessing a protected endpoint with an invalid token."""
        # Include an invalid token in the Authorization header
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalidtoken")

        # Simulate a GET request to a protected endpoint
        response = self.client.get(self.protected_url)

        # Assert access is denied
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)


class WordViewSetTestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username="testuser", password="password")

        # Create a WordsList
        self.words_list = WordsList.objects.create(name="Test List", user=self.user)

        # Create some Words
        self.word1 = Word.objects.create(word="Write", translation="pisać", words_list=self.words_list)
        self.word2 = Word.objects.create(word="Speak", translation="mówić", words_list=self.words_list)

        # Authenticate the client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_list(self):
        url = f"/api/words/?words-list={self.words_list.id}"
        response = self.client.get(url)

    def test_create(self):
        url = f"/api/words/?words-list={self.words_list.id}"
        payload = {
            "add": [
                {"word": "play", "translation": "grać"}
            ],
            "update": [
                {"id": self.word1.id, "word": "Write Updated", "translation": "pisać zaktualizowane"}
            ],
            "delete": [self.word2.id]
        }

        response = self.client.post(url, payload, format="json")

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Word.objects.filter(words_list=self.words_list).count(), 2)
        self.assertTrue(Word.objects.filter(word="play", translation="grać").exists())
        self.assertTrue(Word.objects.filter(word="Write Updated").exists())
        self.assertFalse(Word.objects.filter(id=self.word2.id).exists())

    def test_create_with_invalid_words_list_id(self):
        invalid_words_list_id = self.words_list.id + 1000
        url = f"/api/words/?words-list={invalid_words_list_id}"

        payload = {
            "add": [
                {"word": "play", "translation": "grać"}
            ],
            "update": [
                {"id": self.word1.id, "word": "Write Updated", "translation": "pisać zaktualizowane"}
            ],
            "delete": [self.word2.id]
        }

        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class WordsListViewSetTests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username="testuser", password="password")

        # Create test WordsLists
        self.words_list1 = WordsList.objects.create(name="New", user=self.user)
        self.words_list2 = WordsList.objects.create(name="New 2", user=self.user)
        self.words_list3 = WordsList.objects.create(name="New 3", user=self.user)

        # Authenticate the client
        self.client.force_authenticate(user=self.user)

        # URLs
        self.list_url = "/api/words-lists/"
        self.detail_url1 = f"/api/words-lists/{self.words_list1.id}/"
        self.detail_url2 = f"/api/words-lists/{self.words_list2.id}/"
        self.detail_url3 = f"/api/words-lists/{self.words_list3.id}/"

    def test_get_all_words_lists(self):
        """Test retrieving all WordsLists."""
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # Ensure all lists are returned
        self.assertEqual(response.data[0]["name"], self.words_list1.name)
        self.assertEqual(response.data[1]["name"], self.words_list2.name)
        self.assertEqual(response.data[2]['name'], self.words_list3.name)

    def test_get_single_words_list(self):
        """Test retrieving a single WordsList."""
        response = self.client.get(self.detail_url1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.words_list1.name)
        self.assertEqual(response.data["id"], self.words_list1.id)

    def test_create_words_list(self):
        """Test creating a WordsList."""
        payload = {"name": "New 3"}
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_words_list(self):
        """Test updating a WordsList."""
        payload = {"name": "Updated Name"}
        response = self.client.patch(self.detail_url1, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.words_list1.refresh_from_db()  # Refresh the instance from the database
        self.assertEqual(self.words_list1.name, "Updated Name")

    def test_delete_words_list(self):
        """Test deleting a WordsList."""
        response = self.client.delete(self.detail_url1)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WordsList.objects.filter(id=self.words_list1.id).exists())

    def test_get_empty_words_list(self):
        """Test retrieving an empty WordsList."""
        response = self.client.get(self.detail_url3)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class GenerateStoryAPIViewTestCase(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')

        self.url = '/api/generate-story/'
        self.payload = {
            "words": ["apple", "journey", "music"],
            "language_level": "B1",
            "tone": "Inspiring"
        }
        # Authenticate the client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_generate_story_authenticated(self):
        """Test endpoint for authenticated user"""
        response = self.client.post(self.url, data=self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("story", response.data)
        self.assertIn("questions", response.data)
        self.assertIn("answers", response.data)

    def test_generate_story_unauthenticated(self):
        """Test endpoint for unauthenticated user"""
        self.client.logout()
        response = self.client.post(self.url, data=self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_generate_story_missing_words(self):
        """Test missing words field"""
        payload = {
            "language_level": "B1",
            "tone": "Inspiring"
        }
        response = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_generate_story_invalid_words(self):
        """Test invalid words field"""
        payload = {
            "words": "not-a-list",
            "language_level": "B1",
            "tone": "Inspiring"
        }
        response = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)


class WordsReviewViewTests(APITestCase):

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username="testuser", password="testpassword")
        self.client.force_authenticate(user=self.user)

        # Create a WordsList for the test user
        self.words_list = WordsList.objects.create(name="Test List", user=self.user)

        # Create test words associated with the words list
        self.word1 = Word.objects.create(word="test", translation="test_translation", words_list=self.words_list)
        self.word2 = Word.objects.create(word="example", translation="example_translation", words_list=self.words_list)

        # Define the URL for the endpoint
        self.url = "/api/words-review/"

    def test_valid_flashcards_update(self):
        """
        Test updating a word repetition with valid data for the 'flashcards' game.
        """
        payload = {
            "flashcards": [
                {"word_id": self.word1.id, "rating": 3}
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Words updated successfully.")
        self.assertIn("updated_words", response.data)
        self.assertEqual(len(response.data["updated_words"]), 1)

        # Check that the word was updated
        self.word1.refresh_from_db()
        self.assertIsNotNone(self.word1.next_review)
        self.assertIsNotNone(self.word1.last_reviewed)

    def test_valid_write_words_update(self):
        """
        Test updating a word repetition with valid data for the 'write_words' game.
        """
        payload = {
            "write_words": [
                {"word_id": self.word1.id, "typed_word": "test"}
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Words updated successfully.")
        self.assertIn("updated_words", response.data)
        self.assertEqual(len(response.data["updated_words"]), 1)

        # Check that the word was updated
        self.word1.refresh_from_db()
        self.assertIsNotNone(self.word1.next_review)

    def test_invalid_game_type(self):
        """
        Test the endpoint with an invalid game type.
        """
        payload = {
            "invalid_game": [
                {"word_id": self.word1.id, "rating": 3}
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("errors", response.data)

    def test_invalid_rating(self):
        """
        Test the endpoint with an invalid rating (greater than max allowed for the game type).
        """
        payload = {
            "flashcards": [
                {"word_id": self.word1.id, "rating": 10}  # Invalid rating (greater than max allowed)
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("errors", response.data)

    def test_invalid_word_id(self):
        """
        Test the endpoint with a non-existent word ID.
        """
        payload = {
            "flashcards": [
                {"word_id": 9999, "rating": 3}  # Non-existent Word ID
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data['errors'][0])

    def test_missing_required_field(self):
        """
        Test the endpoint with a missing required field.
        """
        payload = {
            "flashcards": [
                {"rating": 3}  # Missing 'word_id'
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("errors", response.data)

    def test_missing_typed_word_in_write_words(self):
        """
        Test the 'write_words' game with a missing 'typed_word' field.
        """
        payload = {
            "write_words": [
                {"word_id": self.word1.id}  # Missing 'typed_word'
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("errors", response.data)

    def test_empty_request(self):
        """
        Test sending an empty request.
        """
        payload = {}

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_mixed_valid_and_invalid_entries(self):
        """
        Test sending a mix of valid and invalid entries in the request.
        """
        payload = {
            "flashcards": [
                {"word_id": self.word1.id, "rating": 3},  # Valid
                {"word_id": 9999, "rating": 3}  # Invalid word_id
            ],
            "write_words": [
                {"word_id": self.word2.id, "typed_word": "example"},  # Valid
                {"word_id": self.word1.id}  # Missing 'typed_word'
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_207_MULTI_STATUS)
        self.assertIn("updated_words", response.data)
        self.assertIn("errors", response.data)
        self.assertEqual(len(response.data["updated_words"]), 2)  # Two words successfully updated
        self.assertGreater(len(response.data["errors"]), 0)  # Errors present

    def test_unauthenticated_user(self):
        """
        Test the endpoint for unauthenticated users.
        """
        self.client.logout()
        payload = {
            "flashcards": [
                {"word_id": self.word1.id, "rating": 3}
            ]
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

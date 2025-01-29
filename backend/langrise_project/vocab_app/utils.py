from datetime import datetime
from django.utils.timezone import now, make_aware, get_current_timezone
from supermemo2 import first_review, review
from .models import Word
from difflib import SequenceMatcher


def update_word_repetition(word: Word, rating: int) -> Word:
    """
    Updates the repetition information of a given word based on its review quality rating.

    This function uses spaced repetition algorithm principles to calculate the
    next review date, interval, easiness factor, and repetitions for a word
    based on the quality of the review rating provided. If the word has not
    been previously reviewed, it initializes the review data with a first
    review. The word's review progress is then updated and persisted.

    :param word: The word object that represents the word being reviewed.
    :param rating: The quality rating for the current review, on a
        scale (0-5) determining how well the word was recalled.
    :return: The updated word object after applying the review calculations.
    :rtype: Word
    """
    date_now = now()
    print(date_now)

    if not word.last_reviewed:
        sm_result = first_review(quality=rating, review_datetime=date_now)
    else:
        sm_result = review(
            quality=rating,
            easiness=word.easiness,
            interval=word.interval,
            repetitions=word.repetitions,
            review_datetime=date_now
        )

    word.last_reviewed = date_now
    review_datetime = sm_result['review_datetime']
    if isinstance(review_datetime, str):
        review_datetime = datetime.fromisoformat(review_datetime)

    if review_datetime.tzinfo is None or review_datetime.tzinfo.utcoffset(review_datetime) is None:
        review_datetime = make_aware(review_datetime, get_current_timezone())

    word.next_review = review_datetime

    word.interval = sm_result['interval']
    word.easiness = sm_result['easiness']
    word.repetitions = sm_result['repetitions']

    word.save()
    return word


def compare_word_similarity(original: str, user_input: str) -> float:
    """
    Compares the similarity between two words or phrases using a similarity ratio. It computes
    a measure of similarity based on the sequences of characters in the input strings.

    The function takes two strings as inputs, converts them to lowercase for case-insensitive
    comparison, and calculates their similarity ratio using the SequenceMatcher from the
    `difflib` library. It returns a floating-point value between 0 and 1, where 1 indicates
    identical strings and values closer to 0 represent less similarity.

    :param original: The original word or phrase against which comparison is made.
    :type original: str
    :param user_input: The input word or phrase to be compared with the original.
    :type user_input: str
    :return: A floating-point similarity ratio, where 1 denotes identical inputs and closer
             to 0 represents less similarity.
    :rtype: float
    """
    similarity_ratio = SequenceMatcher(None, original, user_input).ratio()
    return similarity_ratio


def get_grade_based_on_similarity(similarity_ratio: float) -> int:
    """
    Determines a grade based on a given similarity ratio. The function evaluates
    the similarity ratio and assigns a corresponding grade according to predefined
    thresholds. The grade ranges from 0 to 5, with higher similarity ratios
    receiving higher grades.

    :param similarity_ratio: A float representing the similarity ratio,
        where 1.0 means completely similar and 0.0 means no similarity.
    :return: An integer grade ranging from 0 to 5, proportional to the
        level of similarity indicated by the similarity ratio.
    """
    if similarity_ratio >= 0.96:
        return 5
    elif similarity_ratio >= 0.88:
        return 4
    elif similarity_ratio >= 0.75:
        return 3
    elif similarity_ratio >= 0.6:
        return 2
    elif similarity_ratio >= 0.45:
        return 1
    else:
        return 0

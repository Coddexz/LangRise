import api from '../services/axiosConfig'

export const GAME_RATING_LIMITS = {
    write_words: 5,
    story: 4,
    match_words: 4,
    flashcards: 3,
} as const

export type GameName = keyof typeof GAME_RATING_LIMITS

export type GamesRatings = {
    game: GameName
    maxRating: (typeof GAME_RATING_LIMITS)[GameName]
}

type WordReviewPayload<G extends GameName> = {
    word_id: number
    rating?: 0 | 1 | 2 | 3 | 4 | 5 extends (typeof GAME_RATING_LIMITS)[G] ? never : (0 | 1 | 2 | 3 | 4 | 5 & (typeof GAME_RATING_LIMITS)[G])
    typed_word?: G extends "write_words" ? string : never
}

type WordReviewResponse = {
    word_id: number
    next_review: string
}

/**
 * Sends a word review request to the API.
 * Ensures the correct `rating` based on `game`.
 */
export async function sendWordReview<G extends GameName>(
    game: G,
    words: WordReviewPayload<G> | WordReviewPayload<G>[]
): Promise<WordReviewResponse[]> {
    try {
        const formattedWords = Array.isArray(words) ? words : [words]

        formattedWords.forEach(word => {
            if (word.rating !== undefined && (word.rating > GAME_RATING_LIMITS[game] || word.rating < 0)) {
                throw new Error(`Invalid rating ${word.rating} for game ${game}. Max allowed is ${GAME_RATING_LIMITS[game]}.`)
            }
        })

        const payload = { [game]: formattedWords }
        const response = await api.post(`/api/words-review/`, payload)

        return response.data
    } catch (error: any) {
        console.error("Error during sendWordReview request:", error)
        throw new Error(error?.response?.data?.detail || "Could not process word review.")
    }
}
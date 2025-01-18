import api from '../services/axiosConfig'

type WordPayload = {
    word: string
    translation: string
}

type PostWordsPayload = {
    add: WordPayload[]
    update: WordPayload[]
    delete: number[]
}

export async function postWords(payload: PostWordsPayload, wordsListId: number) {
    try {
        const response = await api.post(`/api/words/?words-list=${wordsListId}`, payload)
        return response.data
    } catch (error: any) {
        console.error("Error during postWords request:", error)
        throw new Error(error?.response?.data?.detail || "Could not save words.")
    }
}
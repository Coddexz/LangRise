import api from '../services/axiosConfig'

type DeleteListParams = {
  id: number
}

export async function deleteList({ id }: DeleteListParams) {
  try {
    const response = await api.delete(`/api/words-lists/${id}/`)
    return response.data
  } catch (error: any) {
    console.error('Error during delete request:', error)
    throw new Error(error?.response?.data?.detail || 'Could not delete list.')
  }
}

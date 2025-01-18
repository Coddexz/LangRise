import api from '../services/axiosConfig'

type CreateListParams = {
  name: string
}

export async function createList({ name }: CreateListParams) {
  try {
    const response = await api.post('/api/words-lists/', { name })
    return response.data
  } catch (error: any) {
    console.error('Error during create request:', error)
    throw new Error(error?.response?.data?.detail || 'Could not create list.')
  }
}

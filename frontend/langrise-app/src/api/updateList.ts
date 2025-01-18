import api from '../services/axiosConfig';

type UpdateListParams = {
    id: number;
    newName: string;
};

export async function updateList({ id, newName }: UpdateListParams) {
    try {
        const response = await api.patch(
            `/api/words-lists/${id}/`,
            { name: newName }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error during update request:', error);

        throw new Error(
            error?.response?.data?.detail || 'Could not update list.'
        );
    }
}
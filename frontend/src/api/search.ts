import axios from './axios';

export const searchProducts = async (searchTerm: string, page: number, size: number) => {
    try {
        const response = await axios.post(`/products/page/${page}`,
            { name: searchTerm },
            {
                params: {
                    page: page,
                    size: size
                }
            });
        return response.data;
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
};

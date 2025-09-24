import axios from './axios';

// Matches backend com.finale.amazon.dto.ProductFilterDto
export interface ProductFilterDto {
  name?: string | null;
  categoryId?: number | null;
  lowerPriceBound?: number | null;
  upperPriceBound?: number | null;
  sellerIds?: number[] | null;
  slugs?: string[] | null;
  characteristics?: Record<string, string> | null; // key: characteristic type name, value: selected value
}

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

export const searchProductsWithFilter = async (
  filter: ProductFilterDto,
  page: number,
  size: number,
  signal?: AbortSignal,
  sort?: string
) => {
  try {
    const response = await axios.post(`/products/page/${page}`, filter, {
      params: { page, size, ...(sort ? { sort } : {}) },
      signal,
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products with filter:', error);
    throw error;
  }
};

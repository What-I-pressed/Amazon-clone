import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchProducts } from '../api/search';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const SearchResults: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const query = useQuery();
    const searchTerm = query.get('query');

    useEffect(() => {
        const fetchProducts = async () => {
            if (searchTerm) {
                setLoading(true);
                try {
                    const results = await searchProducts(searchTerm, 0, 10);
                    setProducts(results.content);
                } catch (err) {
                    setError('Failed to fetch search results.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProducts();
    }, [searchTerm]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Search Results for "{searchTerm}"</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(product => (
                    <div key={product.id} className="border p-4 rounded">
                        <h2 className="text-lg font-semibold">{product.name}</h2>
                        <p>{product.description}</p>
                        <p className="text-right font-bold">${product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResults;

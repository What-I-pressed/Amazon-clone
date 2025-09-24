import React, { useEffect, useState } from "react";

export type CharacteristicsSelection = Record<string, string>; // { [typeName]: value }

export interface ProductFiltersState {
  lowerPriceBound?: number | null;
  upperPriceBound?: number | null;
  characteristics?: CharacteristicsSelection | null;
  sortField?: 'price' | 'avgRating' | 'views' | null;
  sortDir?: 'asc' | 'desc' | null;
}

interface ProductFiltersProps {
  initial?: ProductFiltersState;
  onChange: (state: ProductFiltersState) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ initial, onChange }) => {
  const [priceMin, setPriceMin] = useState<number>(initial?.lowerPriceBound ?? 0);
  const [priceMax, setPriceMax] = useState<number>(initial?.upperPriceBound ?? 0);
  const [availableCharacteristics] = useState<Record<string, string[]>>({});
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<CharacteristicsSelection>(initial?.characteristics ?? {});
  const [sortField, setSortField] = useState<'price' | 'avgRating' | 'views' | null>(initial?.sortField ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(initial?.sortDir ?? null);


  // Note: characteristics and sellers used to depend on subcategory.
  // Categories were removed, so we skip fetching and leave these empty for now.

  // Notify parent on changes (debounced)
  useEffect(() => {
    const cleanChars = Object.fromEntries(
      Object.entries(selectedCharacteristics).filter(([_, v]) => v && v.trim() !== '')
    );
    const handle = setTimeout(() => {
      onChange({
        lowerPriceBound: priceMin || null,
        upperPriceBound: priceMax || null,
        characteristics: Object.keys(cleanChars).length ? cleanChars : null,
        sortField: sortField ?? null,
        sortDir: sortDir ?? null,
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [priceMin, priceMax, selectedCharacteristics, sortField, sortDir, onChange]);

  return (
    <div className="space-y-6">
      {/* Categories section removed per request */}

      <div>
        <h3 className="text-lg font-semibold mb-2">Price</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceMin}
            min={0}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            placeholder="Min"
            className="w-24 border rounded px-2 py-1"
          />
          <span>-</span>
          <input
            type="number"
            value={priceMax}
            min={0}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            placeholder="Max"
            className="w-24 border rounded px-2 py-1"
          />
        </div>
      </div>

      {Object.keys(availableCharacteristics).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Characteristics</h3>
          {Object.entries(availableCharacteristics).map(([typeName, values]) => (
            <div key={typeName}>
              <div className="text-sm font-medium text-gray-800 mb-1">{typeName}</div>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => {
                  const active = selectedCharacteristics[typeName] === val;
                  return (
                    <button
                      type="button"
                      key={val}
                      className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
                      onClick={() =>
                        setSelectedCharacteristics((prev) => {
                          if (active) {
                            const { [typeName]: _, ...rest } = prev;
                            return rest; // remove key on deselect
                          }
                          return { ...prev, [typeName]: val };
                        })
                      }
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sellers section removed (depends on categories/subcategory) */}

      {/* Sorting */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sort By</h3>
        <div className="flex items-center gap-3">
          <select
            className="border rounded px-2 py-1"
            value={sortField ?? ''}
            onChange={(e) => setSortField((e.target.value || null) as any)}
          >
            <option value="">None</option>
            <option value="price">Price</option>
            <option value="avgRating">Rating</option>
            <option value="views">Views</option>
          </select>
          <select
            className="border rounded px-2 py-1"
            value={sortDir ?? ''}
            onChange={(e) => setSortDir((e.target.value || null) as any)}
          >
            <option value="">—</option>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;

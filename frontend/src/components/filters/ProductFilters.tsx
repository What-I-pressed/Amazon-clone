import React, { useEffect, useRef, useState } from "react";

export type CharacteristicsSelection = Record<string, string | null>; // { [typeName]: value }

export interface ProductFiltersState {
  lowerPriceBound: number | null;
  upperPriceBound: number | null;
  characteristics: Record<string, string> | null;
  sortField: 'price' | 'avgRating' | 'views' | null;
  sortDir: 'asc' | 'desc' | null;
}

interface ProductFiltersProps {
  initial?: ProductFiltersState;
  onChange: (state: ProductFiltersState) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ initial, onChange }) => {
  const [priceMinInput, setPriceMinInput] = useState<string>(initial?.lowerPriceBound?.toString() ?? '');
  const [priceMaxInput, setPriceMaxInput] = useState<string>(initial?.upperPriceBound?.toString() ?? '');
  const [availableCharacteristics] = useState<Record<string, string[]>>({});
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<CharacteristicsSelection>(initial?.characteristics ?? {} as CharacteristicsSelection);
  const [sortField, setSortField] = useState<'price' | 'avgRating' | 'views' | null>(initial?.sortField ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(initial?.sortDir ?? null);
  const [appliedPriceMin, setAppliedPriceMin] = useState<string>(initial?.lowerPriceBound?.toString() ?? '');
  const [appliedPriceMax, setAppliedPriceMax] = useState<string>(initial?.upperPriceBound?.toString() ?? '');
  const [appliedSort, setAppliedSort] = useState<string>(initial?.sortField && initial?.sortDir ? `${initial.sortField} ${initial.sortDir}` : '');
  const skipNotifyRef = useRef(false);

  // Note: characteristics and sellers used to depend on subcategory.
  // Categories were removed, so we skip fetching and leave these empty for now.

  useEffect(() => {
    // Programmatic initialization from parent; avoid notifying parent
    skipNotifyRef.current = true;
    setPriceMinInput(initial?.lowerPriceBound?.toString() ?? '');
    setPriceMaxInput(initial?.upperPriceBound?.toString() ?? '');
    setSelectedCharacteristics((initial?.characteristics ?? {}) as CharacteristicsSelection);
    setSortField(initial?.sortField ?? null);
    setSortDir(initial?.sortDir ?? null);

    // Also set applied states from initial for badges
    setAppliedPriceMin(initial?.lowerPriceBound?.toString() ?? '');
    setAppliedPriceMax(initial?.upperPriceBound?.toString() ?? '');
    setAppliedSort(initial?.sortField && initial?.sortDir ? `${initial.sortField} ${initial.sortDir}` : '');

    // Re-enable notifications after state sync
    const t = setTimeout(() => { skipNotifyRef.current = false; }, 0);
    return () => clearTimeout(t);
  }, [initial]);

  // Notify parent on changes (debounced)
  useEffect(() => {
    if (skipNotifyRef.current) return;
    const cleanChars = Object.fromEntries(
      Object.entries(selectedCharacteristics).filter(([_, v]) => v !== null && v.trim() !== '')
    );
    
    const lowerPriceBound = priceMinInput ? (isNaN(parseFloat(priceMinInput)) ? null : parseFloat(priceMinInput)) : null;
    const upperPriceBound = priceMaxInput ? (isNaN(parseFloat(priceMaxInput)) ? null : parseFloat(priceMaxInput)) : null;

    const handle = setTimeout(() => {
      setAppliedPriceMin(priceMinInput);
      setAppliedPriceMax(priceMaxInput);
      setAppliedSort(sortField && sortDir ? `${sortField} ${sortDir}` : '');
      onChange({
        lowerPriceBound,
        upperPriceBound,
        characteristics: Object.keys(cleanChars).length ? (cleanChars as Record<string, string>) : null,
        sortField: sortField ?? null,
        sortDir: sortDir ?? null,
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [priceMinInput, priceMaxInput, selectedCharacteristics, sortField, sortDir, onChange]);

  return (
    <div className="space-y-6">
      {/* Categories section removed per request */}

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Price</h3>
          {appliedPriceMin || appliedPriceMax ? (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Applied: {appliedPriceMin} - {appliedPriceMax}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={priceMinInput}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setPriceMinInput(value);
              }
            }}
            placeholder="Min"
            className="w-24 border rounded px-2 py-1"
          />
          <span>-</span>
          <input
            type="text"
            inputMode="decimal"
            value={priceMaxInput}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setPriceMaxInput(value);
              }
            }}
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sort By</h3>
          {appliedSort ? (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Applied: {appliedSort}
            </span>
          ) : null}
        </div>
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

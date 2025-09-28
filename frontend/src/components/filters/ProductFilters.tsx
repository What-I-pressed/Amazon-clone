import React, { useEffect, useRef, useState } from "react";
import { getCustomCharacteristicsResilient } from "../../api/characteristics";

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
  // Context to fetch available characteristics
  searchName?: string;
  subcategoryId?: number;
  categoryId?: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ initial, onChange, searchName, subcategoryId, categoryId }) => {
  const [priceMinInput, setPriceMinInput] = useState<string>(initial?.lowerPriceBound?.toString() ?? '');
  const [priceMaxInput, setPriceMaxInput] = useState<string>(initial?.upperPriceBound?.toString() ?? '');
  const [availableCharacteristics, setAvailableCharacteristics] = useState<Record<string, string[]>>({});
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<CharacteristicsSelection>(initial?.characteristics ?? {} as CharacteristicsSelection);
  const [sortField, setSortField] = useState<'price' | 'avgRating' | 'views' | null>(initial?.sortField ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(initial?.sortDir ?? null);
  const [appliedPriceMin, setAppliedPriceMin] = useState<string>(initial?.lowerPriceBound?.toString() ?? '');
  const [appliedPriceMax, setAppliedPriceMax] = useState<string>(initial?.upperPriceBound?.toString() ?? '');
  const skipNotifyRef = useRef(false);

  // Load available characteristics whenever search context changes
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const payload = {
          name: searchName ?? undefined,
          categoryId: categoryId ?? undefined,
          subcategoryId: subcategoryId ?? undefined,
        };
        // If neither categoryId nor subcategoryId nor name present, skip fetch
        if (!payload.name && payload.categoryId == null && payload.subcategoryId == null) {
          setAvailableCharacteristics({});
          return;
        }
        const data = await getCustomCharacteristicsResilient(payload);
        if (ignore) return;
        setAvailableCharacteristics(data || {});
        // prune selections that are no longer available
        setSelectedCharacteristics((prev) => {
          const next: CharacteristicsSelection = {};
          for (const [type, val] of Object.entries(prev)) {
            if (!val) continue;
            const options = data?.[type] ?? [];
            if (options.includes(val)) {
              next[type] = val;
            }
          }
          return next;
        });
      } catch (e) {
        console.warn('Failed to load custom characteristics', e);
        if (!ignore) setAvailableCharacteristics({});
      }
    }, 200);
    return () => {
      ignore = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchName, subcategoryId, categoryId]);

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

    // Re-enable notifications after state sync
    const t = setTimeout(() => { skipNotifyRef.current = false; }, 0);
    return () => clearTimeout(t);
  }, [initial]);

  // Notify parent on changes (no debounce to ensure Apply uses freshest state)
  useEffect(() => {
    if (skipNotifyRef.current) return;
    const cleanChars = Object.fromEntries(
      Object.entries(selectedCharacteristics).filter(([_, v]) => v !== null && v.trim() !== '')
    );

    const lowerPriceBound = priceMinInput ? (isNaN(parseFloat(priceMinInput)) ? null : parseFloat(priceMinInput)) : null;
    const upperPriceBound = priceMaxInput ? (isNaN(parseFloat(priceMaxInput)) ? null : parseFloat(priceMaxInput)) : null;

    setAppliedPriceMin(priceMinInput);
    setAppliedPriceMax(priceMaxInput);
    onChange({
      lowerPriceBound,
      upperPriceBound,
      characteristics: Object.keys(cleanChars).length ? (cleanChars as Record<string, string>) : null,
      sortField: sortField ?? null,
      sortDir: sortDir ?? null,
    });
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

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-semibold">Characteristics</h3>
          {Object.keys(selectedCharacteristics).length > 0 ? (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Applied: {Object.keys(selectedCharacteristics).length}
            </span>
          ) : null}
        </div>
        {Object.keys(availableCharacteristics).length === 0 ? (
          <p className="text-sm text-gray-500">No characteristics available for the current search. Try selecting a subcategory or a more specific query.</p>
        ) : (
          Object.entries(availableCharacteristics).map(([typeName, values]) => (
            <div key={typeName}>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-medium text-gray-800">{typeName}</div>
                {selectedCharacteristics[typeName] ? (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {selectedCharacteristics[typeName]}
                  </span>
                ) : null}
              </div>
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
          ))
        )}
      </div>

      {/* Sellers section removed (depends on categories/subcategory) */}

      {/* Sorting removed; now handled in page header */}
    </div>
  );
};

export default ProductFilters;

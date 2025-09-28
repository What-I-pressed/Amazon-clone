import React, { useEffect, useRef, useState } from "react";
import { getCustomCharacteristicsResilient } from "../../api/characteristics";

export type CharacteristicsSelection = Record<string, string[]>; // { [typeName]: [values] }

// a ProductFiltersState: characteristics may contain multiple selected values per type
export interface ProductFiltersState {
  lowerPriceBound: number | null;
  upperPriceBound: number | null;
  characteristics: Record<string, string[]> | null;
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

const normalizeCharacteristics = (
  input: ProductFiltersState['characteristics'] | Record<string, string> | null
): CharacteristicsSelection => {
  const result: CharacteristicsSelection = {};
  if (!input) return result;
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      const cleaned = value.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
      if (cleaned.length) {
        result[key] = cleaned;
      }
    } else if (typeof value === 'string' && value.trim() !== '') {
      result[key] = [value];
    }
  }
  return result;
};

const ProductFilters: React.FC<ProductFiltersProps> = ({ initial, onChange, searchName, subcategoryId, categoryId }) => {
  const [priceMinInput, setPriceMinInput] = useState<string>(initial?.lowerPriceBound?.toString() ?? '');
  const [priceMaxInput, setPriceMaxInput] = useState<string>(initial?.upperPriceBound?.toString() ?? '');
  const [availableCharacteristics, setAvailableCharacteristics] = useState<Record<string, string[]>>({});
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<CharacteristicsSelection>(normalizeCharacteristics(initial?.characteristics ?? null));
  const [expandedCharacteristics, setExpandedCharacteristics] = useState<Record<string, boolean>>({});
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
          for (const [type, values] of Object.entries(prev)) {
            const available = new Set(data?.[type] ?? []);
            const filtered = values.filter((v) => available.has(v));
            if (filtered.length) {
              next[type] = filtered;
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
    setSelectedCharacteristics(normalizeCharacteristics(initial?.characteristics ?? null));
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
      Object.entries(selectedCharacteristics)
        .map(([key, values]) => [key, values.filter((v) => v && v.trim() !== '')])
        .filter(([_, values]) => values.length > 0)
    ) as CharacteristicsSelection;

    const lowerPriceBound = priceMinInput ? (isNaN(parseFloat(priceMinInput)) ? null : parseFloat(priceMinInput)) : null;
    const upperPriceBound = priceMaxInput ? (isNaN(parseFloat(priceMaxInput)) ? null : parseFloat(priceMaxInput)) : null;

    setAppliedPriceMin(priceMinInput);
    setAppliedPriceMax(priceMaxInput);
    onChange({
      lowerPriceBound,
      upperPriceBound,
      characteristics: Object.keys(cleanChars).length ? cleanChars : null,
      sortField: sortField ?? null,
      sortDir: sortDir ?? null,
    });
  }, [priceMinInput, priceMaxInput, selectedCharacteristics, sortField, sortDir, onChange]);

  return (
    <div className="space-y-6">
      {/* Categories section removed per request */}

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl">Price</h3>
          {appliedPriceMin || appliedPriceMax ? (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {appliedPriceMin} - {appliedPriceMax}
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
            className="w-24 border rounded-2xl px-2 py-1"
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
            className="w-24 border rounded-2xl px-2 py-1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-1">
          
          <h3 className="text-2xl">Characteristics</h3>
          {Object.keys(selectedCharacteristics).length > 0 ? (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {Object.values(selectedCharacteristics).reduce((acc, arr) => acc + arr.length, 0)}
            </span>
          ) : null}
        </div>
        {Object.keys(availableCharacteristics).length === 0 ? (
          <p className="text-sm text-[#838383]">No characteristics available for the current search. Try selecting a subcategory or a more specific query.</p>
        ) : (
          Object.entries(availableCharacteristics).map(([typeName, values]) => {
            const selectedValues = selectedCharacteristics[typeName] ?? [];
            const isExpanded = expandedCharacteristics[typeName] ?? false;
            return (
              <div key={typeName} className="rounded-lg bg-white/60 px-3 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-[#2a2a2a]">{typeName}</div>
                    {selectedValues.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedValues.slice(0, 3).map((chip) => (
                          <span key={chip} className="text-xs bg-gray-100 text-[#454545] px-2 py-0.5 rounded-full">
                            {chip}
                          </span>
                        ))}
                        {selectedValues.length > 3 ? (
                          <span className="text-xs text-[#838383]">+{selectedValues.length - 3}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center w-7 h-7 rounded-full text-[#585858] hover:bg-[#e7e7e7] transition"
                    onClick={() =>
                      setExpandedCharacteristics((prev) => ({
                        ...prev,
                        [typeName]: !isExpanded,
                      }))
                    }
                    aria-label={isExpanded ? `Collapse ${typeName}` : `Expand ${typeName}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {isExpanded ? (
                  <div className="space-y-3 pt-2">
                    <ul className="space-y-1">
                      {values.map((val, idx) => {
                        const active = selectedValues.includes(val);
                        const inputId = `${typeName}-option-${idx}`;
                        return (
                          <li key={val}>
                            <label
                              htmlFor={inputId}
                              className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm cursor-pointer transition ${active ? 'bg-[#151515] text-white' : 'bg-transparent text-[#2a2a2a] hover:bg-gray-100'}`}
                            >
                              <span>{val}</span>
                              <input
                                id={inputId}
                                type="checkbox"
                                name={`characteristic-${typeName}`}
                                value={val}
                                checked={active}
                                onChange={() =>
                                  setSelectedCharacteristics((prev) => {
                                    const current = prev[typeName] ?? [];
                                    if (current.includes(val)) {
                                      const nextVals = current.filter((item) => item !== val);
                                      const { [typeName]: _, ...rest } = prev;
                                      return nextVals.length ? { ...rest, [typeName]: nextVals } : rest;
                                    }
                                    return {
                                      ...prev,
                                      [typeName]: [...current, val],
                                    };
                                  })
                                }
                                className="hidden"
                              />
                            </label>
                          </li>
                        );
                      })}
                    </ul>

                    {selectedValues.length ? (
                      <button
                        type="button"
                        className="text-xs text-[#838383] hover:text-[#454545]"
                        onClick={() =>
                          setSelectedCharacteristics((prev) => {
                            const { [typeName]: _, ...rest } = prev;
                            return rest;
                          })
                        }
                      >
                        Clear {typeName}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Sellers section removed (depends on categories/subcategory) */}

      {/* Sorting removed; now handled in page header */}
    </div>
  );
};

export default ProductFilters;

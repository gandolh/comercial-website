import { useEffect, useState } from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { useQuery } from "@tanstack/react-query";
import { locationsApi } from "@app/apis/locationsApi";
import { queryOptions } from "@tanstack/react-query";

interface CityAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DEBOUNCE_MS = 300;

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function citySearchQuery(q: string) {
  return queryOptions({
    queryKey: ["locations", "cities", q],
    queryFn: () => locationsApi.searchCities(q),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = "Toată România",
  className = "",
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value ?? "");
  const debouncedQ = useDebouncedValue(inputValue, DEBOUNCE_MS);

  const { data, isFetching } = useQuery(citySearchQuery(debouncedQ));
  const cities = data?.items ?? [];

  const handleChange = (val: string) => {
    setInputValue(val);
    onChange?.(val);
  };

  return (
    <Autocomplete.Root
      value={inputValue}
      onValueChange={(val) => handleChange(val)}
      items={cities}
      itemToStringValue={(city) => city}
      openOnInputClick
    >
      <Autocomplete.InputGroup
        className={`relative flex items-center gap-2 ${className}`}
      >
        {isFetching ? (
          <span className="material-symbols-outlined text-outline shrink-0 animate-spin" style={{ fontSize: "20px" }}>
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined text-outline shrink-0">
            location_on
          </span>
        )}
        <Autocomplete.Input
          className="bg-transparent border-none outline-none text-lg py-3 w-40 placeholder:text-outline text-on-surface"
          placeholder={placeholder}
          aria-label="Selectează orașul"
        />
        {inputValue && (
          <Autocomplete.Clear
            aria-label="Șterge locația"
            className="flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              close
            </span>
          </Autocomplete.Clear>
        )}
      </Autocomplete.InputGroup>

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={8} align="start">
          <Autocomplete.Popup className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden min-w-[280px] max-h-72 overflow-y-auto outline-none">
            <Autocomplete.Empty className="px-4 py-3 text-sm text-on-surface-variant">
              {isFetching ? "Se caută..." : "Niciun oraș găsit"}
            </Autocomplete.Empty>
            <Autocomplete.List>
              {cities.map((city) => (
                <Autocomplete.Item
                  key={city}
                  value={city}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm text-on-surface hover:bg-surface-container-low data-[highlighted]:bg-surface-container-low transition-colors"
                >
                  <span className="font-medium">{city}</span>
                </Autocomplete.Item>
              ))}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

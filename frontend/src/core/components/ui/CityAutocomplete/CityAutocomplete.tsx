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
      <Autocomplete.InputGroup className={`relative flex items-center gap-2 ${className}`}>
        {isFetching ? (
          <span
            className="material-symbols-outlined shrink-0 text-outline motion-safe:animate-spin"
            style={{ fontSize: "20px" }}
          >
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined shrink-0 text-outline">location_on</span>
        )}
        <Autocomplete.Input
          className="w-40 border-none bg-transparent py-3 text-lg text-on-surface outline-none placeholder:text-outline"
          placeholder={placeholder}
          aria-label="Selectează orașul"
        />
        {inputValue && (
          <Autocomplete.Clear
            aria-label="Șterge locația"
            className="flex cursor-pointer items-center justify-center text-outline transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              close
            </span>
          </Autocomplete.Clear>
        )}
      </Autocomplete.InputGroup>

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={8} align="start">
          <Autocomplete.Popup className="max-h-72 min-w-[280px] overflow-hidden overflow-y-auto rounded-xl bg-surface-container-lowest shadow-popup outline-none">
            <Autocomplete.Empty className="px-4 py-3 text-sm text-on-surface-variant">
              {isFetching ? "Se caută..." : "Niciun oraș găsit"}
            </Autocomplete.Empty>
            <Autocomplete.List>
              {cities.map((city) => (
                <Autocomplete.Item
                  key={city}
                  value={city}
                  className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-low data-[highlighted]:bg-surface-container-low"
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

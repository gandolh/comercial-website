import { useEffect, useState } from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { listingsApi } from "@app/apis/listingsApi";

interface SearchAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
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

function titleSuggestQuery(q: string) {
  return queryOptions({
    queryKey: ["listings", "suggest", q],
    queryFn: () => listingsApi.suggestTitles(q, 20),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Ce cauți astăzi?",
  className = "",
}: SearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value ?? "");
  const debouncedQ = useDebouncedValue(inputValue, DEBOUNCE_MS);

  const { data, isFetching } = useQuery(titleSuggestQuery(debouncedQ));
  const suggestions = data ?? [];

  const handleChange = (val: string) => {
    setInputValue(val);
    onChange?.(val);
  };

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange?.(val);
    onSelect?.(val);
  };

  return (
    <Autocomplete.Root
      value={inputValue}
      onValueChange={(val) => handleSelect(val)}
      items={suggestions}
      itemToStringValue={(s) => s}
      openOnInputClick
    >
      <Autocomplete.InputGroup className={`relative flex items-center gap-2 ${className}`}>
        {isFetching ? (
          <span
            className="material-symbols-outlined shrink-0 text-on-surface-variant motion-safe:animate-spin"
            style={{ fontSize: "20px" }}
          >
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined shrink-0 text-on-surface-variant">search</span>
        )}
        <Autocomplete.Input
          className="h-12 w-full border-none bg-transparent text-body text-on-surface outline-none placeholder:text-on-surface-variant"
          placeholder={placeholder}
          aria-label="Caută anunțuri"
          onChange={(e) => handleChange(e.target.value)}
        />
        {inputValue && (
          <Autocomplete.Clear
            aria-label="Șterge căutarea"
            className="flex cursor-pointer items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              close
            </span>
          </Autocomplete.Clear>
        )}
      </Autocomplete.InputGroup>

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={8} align="start">
          <Autocomplete.Popup className="max-h-72 min-w-[320px] overflow-hidden overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-popup outline-none">
            <Autocomplete.Empty className="px-4 py-3 text-sm text-on-surface-variant">
              {isFetching ? "Se caută..." : "Niciun rezultat"}
            </Autocomplete.Empty>
            <Autocomplete.List>
              {suggestions.map((title) => (
                <Autocomplete.Item
                  key={title}
                  value={title}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-control text-on-surface transition-colors hover:bg-primary-fixed data-[highlighted]:bg-primary-fixed"
                >
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>
                    search
                  </span>
                  <span>{title}</span>
                </Autocomplete.Item>
              ))}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

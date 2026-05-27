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
      <Autocomplete.InputGroup
        className={`relative flex items-center gap-2 ${className}`}
      >
        {isFetching ? (
          <span
            className="material-symbols-outlined text-outline shrink-0 animate-spin"
            style={{ fontSize: "20px" }}
          >
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined text-outline shrink-0">
            search
          </span>
        )}
        <Autocomplete.Input
          className="w-full bg-transparent border-none outline-none text-lg py-3 placeholder:text-outline text-on-surface"
          placeholder={placeholder}
          aria-label="Caută anunțuri"
          onChange={(e) => handleChange(e.target.value)}
        />
        {inputValue && (
          <Autocomplete.Clear
            aria-label="Șterge căutarea"
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
          <Autocomplete.Popup className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden min-w-[320px] max-h-72 overflow-y-auto outline-none">
            <Autocomplete.Empty className="px-4 py-3 text-sm text-on-surface-variant">
              {isFetching ? "Se caută..." : "Niciun rezultat"}
            </Autocomplete.Empty>
            <Autocomplete.List>
              {suggestions.map((title) => (
                <Autocomplete.Item
                  key={title}
                  value={title}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-on-surface hover:bg-surface-container-low data-[highlighted]:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: "16px" }}>
                    search
                  </span>
                  <span className="font-medium">{title}</span>
                </Autocomplete.Item>
              ))}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

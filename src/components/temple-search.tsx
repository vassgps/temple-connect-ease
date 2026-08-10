import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { API_BASE } from "@/lib/api";

export type TempleSuggestion = {
  title: string;
  slug?: string;
  location?: string | null;
  city?: string | null;
  code?: string | null;
};

/** Autocomplete fetch that can be aborted when the query changes. */
async function fetchSuggestions(query: string, signal: AbortSignal): Promise<TempleSuggestion[]> {
  const url = `${API_BASE}/api/v1/cms/discover/suggestions/?q=${encodeURIComponent(query)}&listing_type=temples`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: unknown } | null;
  const data = (json && typeof json === "object" && "data" in json ? json.data : json) as
    | { results?: TempleSuggestion[]; suggestions?: TempleSuggestion[] }
    | TempleSuggestion[]
    | null;
  if (Array.isArray(data)) return data;
  return data?.results ?? data?.suggestions ?? [];
}

export function TempleSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search temples by name, place or code…",
}: {
  value: string;
  onChange: (v: string) => void;
  /** Fired on Enter, search button, or picking a suggestion. */
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [items, setItems] = useState<TempleSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const pickedRef = useRef<string | null>(null);

  /* debounce + abort */
  useEffect(() => {
    const query = value.trim();
    if (query.length < 2 || query === pickedRef.current) {
      setItems([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetchSuggestions(query, ctrl.signal)
        .then((list) => {
          setItems(list);
          setActive(-1);
          setOpen(list.length > 0);
        })
        .catch(() => void 0);
    }, 300);
    return () => {
      window.clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  /* tap outside closes */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (s: TempleSuggestion) => {
    pickedRef.current = s.title;
    onChange(s.title);
    setOpen(false);
    setItems([]);
    onSearch(s.title);
    inputRef.current?.focus();
  };

  const submit = () => {
    const query = value.trim();
    setOpen(false);
    if (!query) return;
    onSearch(query);
  };

  return (
    <div ref={boxRef} className="relative">
      <Search className="size-5 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          pickedRef.current = null;
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (open && active >= 0 && items[active]) pick(items[active]);
            else submit();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (items.length) {
              setOpen(true);
              setActive((i) => (i + 1) % items.length);
            }
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (items.length) setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        enterKeyHint="search"
        aria-label="Search temples"
        placeholder={placeholder}
        className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-muted text-[15px] outline-none placeholder:text-ink-soft"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              pickedRef.current = null;
              onChange("");
              setItems([]);
              setOpen(false);
              onSearch("");
              inputRef.current?.focus();
            }}
            className="size-8 grid place-items-center rounded-full text-ink-soft active:bg-border"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          className="h-9 px-3 rounded-xl bg-earth text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-all duration-150"
        >
          Search
        </button>
      </div>

      {open && items.length > 0 && (
        <div className="absolute z-40 left-0 right-0 top-full mt-2 rounded-2xl bg-card ring-1 ring-border shadow-soft overflow-hidden max-h-72 overflow-y-auto">
          {items.map((s, i) => (
            <button
              key={`${s.slug ?? s.title}-${i}`}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(s)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-border/60 last:border-0 active:scale-[0.98] active:bg-orange-50 transition-all duration-150 ${
                active === i ? "bg-muted" : ""
              }`}
            >
              <MapPin className="size-4 text-earth mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink text-sm truncate">{s.title}</span>
                {(s.location || s.city) && (
                  <span className="block text-xs text-ink-soft truncate">{s.location || s.city}</span>
                )}
              </span>
              {s.code && (
                <span className="shrink-0 text-[10px] font-bold text-earth bg-earth-soft px-2 py-0.5 rounded">
                  {s.code}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

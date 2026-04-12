import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { COUNTRIES, countryFlag } from "@/lib/schemas";

interface CountryComboboxProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
}

export function CountryCombobox({ value, onChange, id }: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === value) ?? null;

  const filtered = search.length > 0
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase() === search.toLowerCase(),
      )
    : COUNTRIES;

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlighted(0);
  }, [search]);

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      setOpen(true);
      e.preventDefault();
    }
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => Math.max(h - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      const country = filtered[highlighted];
      if (country) {
        onChange(country.code);
        setOpen(false);
        setSearch("");
      }
      e.preventDefault();
    }
  }

  function select(code: string) {
    onChange(code);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="combobox" ref={containerRef}>
      <button
        type="button"
        id={id}
        className={`combobox-trigger${selectedCountry ? " combobox-has-value" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
      >
        {selectedCountry ? (
          <>
            <span className="combobox-flag" aria-hidden="true">
              {countryFlag(selectedCountry.code)}
            </span>
            <span className="combobox-selected-name">{selectedCountry.name}</span>
          </>
        ) : (
          <span className="combobox-placeholder">Select country…</span>
        )}
        <span className="combobox-caret" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="combobox-dropdown" role="dialog" aria-label="Country selection">
          <div className="combobox-search-wrap">
            <input
              ref={searchRef}
              type="text"
              className="combobox-search"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search countries"
              autoComplete="off"
            />
          </div>
          <ul ref={listRef} className="combobox-list" role="listbox" aria-label="Countries">
            {filtered.length === 0 && (
              <li className="combobox-empty">No countries found for "{search}"</li>
            )}
            {filtered.map((country, idx) => (
              <li
                key={country.code}
                role="option"
                aria-selected={country.code === value}
                className={[
                  "combobox-option",
                  country.code === value ? "combobox-option-selected" : "",
                  idx === highlighted ? "combobox-option-highlighted" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={() => select(country.code)}
                onMouseEnter={() => setHighlighted(idx)}
              >
                <span className="combobox-flag" aria-hidden="true">
                  {countryFlag(country.code)}
                </span>
                <span>{country.name}</span>
                {country.code === value && (
                  <span className="combobox-check" aria-hidden="true">✓</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

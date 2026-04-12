import { useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

interface DobInputProps {
  day: string;
  month: string;
  year: string;
  onDayChange: (val: string) => void;
  onMonthChange: (val: string) => void;
  onYearChange: (val: string) => void;
  hint?: string;
}

export function DobInput({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  hint,
}: DobInputProps) {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  function handleDayChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    onDayChange(raw);
    if (raw.length === 2) monthRef.current?.focus();
  }

  function handleMonthChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    onMonthChange(raw);
    if (raw.length === 2) yearRef.current?.focus();
  }

  function handleYearChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    onYearChange(raw);
  }

  function handleMonthKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && month === "") {
      dayRef.current?.focus();
    }
  }

  function handleYearKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && year === "") {
      monthRef.current?.focus();
    }
  }

  return (
    <div className="float-field dob-field float-filled">
      <label className="float-label">Date of birth</label>
      <div className="dob-segments">
        <input
          ref={dayRef}
          className="dob-seg"
          inputMode="numeric"
          placeholder="DD"
          value={day}
          onChange={handleDayChange}
          aria-label="Day"
        />
        <span className="dob-sep" aria-hidden="true">/</span>
        <input
          ref={monthRef}
          className="dob-seg"
          inputMode="numeric"
          placeholder="MM"
          value={month}
          onChange={handleMonthChange}
          onKeyDown={handleMonthKeyDown}
          aria-label="Month"
        />
        <span className="dob-sep" aria-hidden="true">/</span>
        <input
          ref={yearRef}
          className="dob-seg dob-seg-year"
          inputMode="numeric"
          placeholder="YYYY"
          value={year}
          onChange={handleYearChange}
          onKeyDown={handleYearKeyDown}
          aria-label="Year"
        />
      </div>
      <span className="float-accent" aria-hidden="true" />
      {hint && <small className="float-hint">{hint}</small>}
    </div>
  );
}

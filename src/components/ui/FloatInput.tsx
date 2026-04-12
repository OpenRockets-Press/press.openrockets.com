import type { InputHTMLAttributes } from "react";

interface FloatInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function FloatInput({ label, hint, value, className, ...rest }: FloatInputProps) {
  const filled = String(value ?? "").length > 0;
  return (
    <div className={`float-field${filled ? " float-filled" : ""}${className ? ` ${className}` : ""}`}>
      <label className="float-label">{label}</label>
      <input className="float-input" value={value} {...rest} />
      <span className="float-accent" aria-hidden="true" />
      {hint && <small className="float-hint">{hint}</small>}
    </div>
  );
}

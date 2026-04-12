import type { TextareaHTMLAttributes } from "react";

interface FloatTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function FloatTextarea({ label, hint, value, className, ...rest }: FloatTextareaProps) {
  const filled = String(value ?? "").length > 0;
  return (
    <div className={`float-field${filled ? " float-filled" : ""}${className ? ` ${className}` : ""}`}>
      <label className="float-label">{label}</label>
      <textarea className="float-input float-textarea" value={value} {...rest} />
      <span className="float-accent" aria-hidden="true" />
      {hint && <small className="float-hint">{hint}</small>}
    </div>
  );
}

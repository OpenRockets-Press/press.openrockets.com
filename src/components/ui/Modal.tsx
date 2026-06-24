import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthClassBySize: Record<NonNullable<ModalProps["width"]>, string> = {
  sm: "modal-card-sm",
  md: "modal-card-md",
  lg: "modal-card-lg",
};

export function Modal({ open, title, onClose, children, width = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal-card ${widthClassBySize[width]}`}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Dismiss modal" />
    </div>
  );
}

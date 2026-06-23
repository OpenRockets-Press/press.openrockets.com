import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export interface ModalProps {
  isOpen: boolean; // Changed to isOpen based on standard naming & typecheck errors
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "full";
  hideCloseButton?: boolean;
}

const widthClassBySize: Record<NonNullable<ModalProps["width"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "md",
  hideCloseButton = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          onMouseDown={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-ink/60"
          aria-modal="true"
          role="dialog"
          aria-label={title || "Modal Dialog"}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            className={`w-full bg-surface-0 border border-cream-border rounded-xl shadow-2xl flex flex-col overflow-hidden ${widthClassBySize[width]}`}
            style={{ maxHeight: "calc(100vh - 4rem)" }}
          >
            {/* Header Slot */}
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream-border bg-surface-0/80 backdrop-blur-sm z-10 sticky top-0 shrink-0">
                {title ? <h2 className="t-card-title m-0 text-ink">{title}</h2> : <div />}
                {!hideCloseButton && (
                  <button
                    type="button"
                    className="text-ink-light hover:text-ink hover:bg-surface-1 p-1.5 rounded-md transition-colors -mr-2"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body Slot */}
            <div className="p-6 overflow-y-auto flex-1 overscroll-contain text-ink-light">
              {children}
            </div>

            {/* Footer Slot */}
            {footer && (
              <div className="px-6 py-4 border-t border-cream-border bg-surface-1 shrink-0 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal };
}

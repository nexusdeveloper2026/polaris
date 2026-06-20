"use client";

import { useEffect, useCallback, useRef, ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  hideClose?: boolean;
};

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ isOpen, onClose, title, children, footer, size = "md", hideClose }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-md animate-fade-in dark:bg-black/70" />
      <div className={cn(
        "relative z-10 w-full animate-scale-in overflow-hidden rounded-2xl border border-navy-100/60 bg-white shadow-2xl shadow-navy-950/20 dark:border-white/[0.08] dark:bg-navy-800",
        sizes[size]
      )}>
        {title && (
          <div className="flex items-center justify-between border-b border-navy-100/60 bg-navy-50/30 px-6 py-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{title}</h3>
            {!hideClose && (
              <button onClick={onClose} className="rounded-lg p-1.5 text-navy-400 transition-all duration-200 hover:bg-navy-100 hover:text-navy-600 dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/70">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {children && <div className="px-6 py-5">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-navy-100/60 bg-navy-50/20 px-6 py-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
  icon?: ReactNode;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
  icon,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" hideClose>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        {icon || (
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl",
            variant === "danger" ? "bg-red-50 ring-1 ring-red-100 dark:bg-red-500/10 dark:ring-red-500/20" : "bg-amber-50 ring-1 ring-amber-100 dark:bg-amber-500/10 dark:ring-amber-500/20"
          )}>
            <svg className={cn(
              "h-7 w-7",
              variant === "danger" ? "text-red-500" : "text-amber-500"
            )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        )}
        <p className="text-sm leading-relaxed text-navy-500 dark:text-white/60">{message}</p>
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "danger" ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Procesando..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

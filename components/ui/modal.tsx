"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

interface ModalHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
}

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Modal Root                                                         */
/* ------------------------------------------------------------------ */

function Modal({ open, onClose, children, className = "" }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative w-full max-w-lg bg-coglens-card border border-coglens-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden ${className}`}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal.Header                                                       */
/* ------------------------------------------------------------------ */

function ModalHeader({ title, description, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-coglens-primary">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-coglens-secondary">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-coglens-muted hover:text-coglens-primary hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal.Body                                                         */
/* ------------------------------------------------------------------ */

function ModalBody({ className = "", children, ...rest }: ModalBodyProps) {
  return (
    <div className={`px-5 py-3 ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal.Footer                                                       */
/* ------------------------------------------------------------------ */

function ModalFooter({ className = "", children, ...rest }: ModalFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-2 px-5 py-4 border-t border-coglens-border ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export { Modal, ModalHeader, ModalBody, ModalFooter };
export type { ModalProps, ModalHeaderProps };

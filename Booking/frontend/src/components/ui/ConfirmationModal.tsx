'use client';

import { useEffect, useRef } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmButtonClasses = confirmVariant === 'danger'
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-[#d4af37] hover:bg-[#c9a030] text-[#1a1a1a]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md mx-4 bg-[#2a2a2a] rounded-xl border border-[#444444] shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#444444]">
          <h3 className="text-lg font-bold text-[#eaeaea]">{title}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-[#a0a0a0] text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#444444] flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-[#333333] hover:bg-[#444444] text-[#eaeaea] text-sm font-medium transition-colors border border-[#444444] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmButtonClasses}`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

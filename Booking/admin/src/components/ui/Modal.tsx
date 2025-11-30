'use client';

import { useEffect, useCallback, useRef } from 'react';

interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Reusable modal component with dark theme styling
 * Supports backdrop click and Escape key to close
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Add/remove event listener for Escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Focus trap - focus modal when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          ${sizeClasses[size]}
          w-full
          bg-admin-bg-card
          border border-admin-border
          rounded-xl
          shadow-admin-dropdown
          animate-fade-in
          outline-none
        `}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border">
          <h2 id="modal-title" className="text-lg font-semibold text-admin-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

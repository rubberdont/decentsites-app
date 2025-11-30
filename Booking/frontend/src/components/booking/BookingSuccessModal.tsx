'use client';

import React, { useState, useEffect } from 'react';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef: string;
}

/**
 * Success modal shown after booking confirmation
 * Displays booking reference with copy functionality
 */
export default function BookingSuccessModal({
  isOpen,
  onClose,
  bookingRef,
}: BookingSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  // Reset copied state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingRef);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#2a2a2a] rounded-xl border border-[#444444] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#d4af37]/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2
          id="success-modal-title"
          className="text-[#eaeaea] font-bold text-2xl text-center mb-2"
        >
          Booking Confirmed!
        </h2>

        {/* Subtitle */}
        <p className="text-[#a0a0a0] text-center mb-6">
          Your appointment has been successfully booked.
        </p>

        {/* Booking Reference Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <p className="text-[#a0a0a0] text-sm text-center mb-2">
            Your booking reference is:
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-[#d4af37] text-xl tracking-widest font-semibold">
              {bookingRef}
            </span>
            
            <button
              onClick={handleCopy}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${copied
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-white/5 text-[#a0a0a0] hover:text-[#eaeaea] hover:bg-white/10'
                }
              `}
              title={copied ? 'Copied!' : 'Copy to clipboard'}
            >
              {copied ? (
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>

          {copied && (
            <p className="text-green-500 text-xs text-center mt-2">
              Copied to clipboard!
            </p>
          )}
        </div>

        {/* Info text */}
        <p className="text-[#a0a0a0] text-sm text-center mb-6">
          Save this reference to look up your booking later.
        </p>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-lg font-semibold text-base bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c4a030] active:scale-[0.98] transition-all duration-200"
        >
          Done
        </button>
      </div>
    </div>
  );
}

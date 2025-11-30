import { ReactNode } from 'react';

interface BookingDetailCardProps {
  /** Card title displayed in header */
  title: string;
  /** Card content */
  children: ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Reusable detail card component for booking information
 * Styled card with header and content area
 */
export function BookingDetailCard({ title, children, className = '' }: BookingDetailCardProps) {
  return (
    <div
      className={`
        bg-admin-bg-card
        border border-admin-border
        rounded-lg
        shadow-admin-card
        overflow-hidden
        ${className}
      `}
    >
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-admin-border bg-admin-bg/50">
        <h3 className="text-base font-semibold text-admin-text">{title}</h3>
      </div>

      {/* Card Content */}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

export default BookingDetailCard;

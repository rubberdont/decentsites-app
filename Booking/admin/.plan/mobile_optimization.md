# Mobile Optimization Implementation Plan

## Goal
Optimize the Booking Admin interface for shop owners using mobile browsers. The focus is on quick actions, visibility of immediate tasks, and ease of use on small screens.

## User Review Required
> [!IMPORTANT]
> This plan introduces new UI components to the Dashboard. Please review the visual hierarchy proposed below.

- **New "Up Next" Widget**: Will displace some existing dashboard elements on mobile.
- **Quick Actions**: "Walk-in" and "Emergency Close" will be prominent.

## Proposed Changes

### 1. Dashboard Enhancements (`src/app/(dashboard)/page.tsx`)
- **[NEW] Up Next Widget**:
    - Display the immediate next booking (or "No upcoming bookings").
    - Show relative time (e.g., "in 15 mins").
    - Action buttons: "Check In", "Call".
- **[NEW] Daily Snapshot**:
    - Simple metrics: "Today's Revenue" (est), "Total Bookings", "Pending".
    - Placed at the very top for quick status check.
- **[NEW] Shop Status Toggle**:
    - A visible switch to toggle "Busy Mode" (blocks slots for next X hours) or "Emergency Close".

### 2. Booking Cards Optimization (`src/app/(dashboard)/bookings/page.tsx` & components)
- **[MODIFY] Booking List Item**:
    - Add **WhatsApp** and **Phone** icon buttons directly on the list card (no need to open details).
    - Increase touch target sizes for mobile.

### 3. Floating Action Button (Global)
- **[NEW] Global FAB**:
    - Add a fixed "+" button on the bottom right (mobile only).
    - **Quick Walk-in**: Opens a simplified modal:
        - Inputs: Name (optional), Service (dropdown), Time (defaults to now).
        - One-tap "Save & Check-in".

### 4. Layout & Navigation (`src/app/(dashboard)/layout.tsx`)
- **[MODIFY] Mobile Header**:
    - Ensure the "Shop Status" is visible or accessible via a quick menu.

## Verification Plan

### Automated Tests
- Component tests for the new `UpNextWidget` and `QuickWalkInModal`.

### Manual Verification
- **Mobile Emulation**: Use Chrome DevTools (iPhone SE/12 view) to verify:
    - Touch targets are >44px.
    - "Up Next" widget displays correctly with 0, 1, and many bookings.
    - FAB does not obstruct critical content.
- **Flow Test**:
    1.  Create a booking for "10 minutes from now".
    2.  Verify it appears in "Up Next".
    3.  Click "Call" button (check `tel:` check).
    4.  Use FAB to add a walk-in.
    5.  Verify walk-in appears in the daily stats.

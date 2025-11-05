# Enhanced Booking with Time Slots - Implementation Plan

**Created:** November 5, 2025  
**Status:** Awaiting Approval

---

## Problem Statement

Currently, the booking page (`/profiles/[profileId]`) allows customers to select a date and book a service, but it doesn't integrate with the availability/time slot system. Customers can select any date without seeing:
- Which dates have available time slots
- What specific time slots are available for a selected date
- Remaining capacity for each time slot

This creates a disconnect between the owner's availability management (where they set up time slots) and the customer booking experience. Customers might book dates/times that have no availability, leading to booking conflicts and poor user experience.

---

## Current State Analysis

### Current Booking Page
**File:** `src/app/profiles/[profileId]/page.tsx`

**Current Booking Flow:**
1. User selects a service (optional)
2. User picks any date using the Calendar component (line 274-278)
3. User adds notes (optional)
4. User submits booking

**Issues:**
- Calendar shows all future dates as available
- No integration with availability API
- No time slot selection
- Booking model doesn't include time slot information
- Users can double-book or book unavailable slots

**Current Code Snippet (lines 269-279):**
```tsx
{/* Date Selection */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Preferred Date
  </label>
  <Calendar
    selectedDate={bookingDate}
    onDateChange={setBookingDate}
    minDate={new Date()}
  />
</div>
```

### Current Booking Submission (lines 53-88):
```tsx
const handleBookingSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!profile || !bookingDate) return;
  
  try {
    setBookingLoading(true);
    
    const bookingData: BookingCreate = {
      profile_id: profile.id,
      service_id: selectedService || undefined,
      booking_date: bookingDate.toISOString(),
      notes: notes || undefined,
    };
    
    const response = await bookingsAPI.create(bookingData);
    // ... success handling
  }
}
```

**Missing:** Time slot selection, availability checking, slot capacity validation

---

### Current Calendar Component
**File:** `src/components/Calendar.tsx`

**Capabilities:**
- Select single date
- Disable dates (via `disabledDates` prop)
- Set min/max date range
- Keyboard navigation
- Displays selected date

**Limitations:**
- No visual indicators for availability status
- Cannot show different states (available/partially booked/full)
- No integration with availability API

---

### Available APIs

**Already Implemented:**
```typescript
// src/services/api.ts - availabilityAPI

getSlotsForDate: (profileId: string, date: string) => 
  api.get<DateAvailability>(`/availability/profiles/${profileId}/dates/${date}`)

getAvailability: (profileId: string, startDate: string, endDate: string) => 
  api.get<DateAvailability[]>(`/availability/profiles/${profileId}`, {
    params: { start_date: startDate, end_date: endDate }
  })
```

**Types Available:**
```typescript
export interface DateAvailability {
  date: string;
  total_slots: number;
  available_slots: number;
  slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: string;
  profile_id: string;
  date: string;
  time_slot: string;
  max_capacity: number;
  booked_count: number;
  is_available: boolean;
}
```

---

### Backend Booking Model
**File:** `backend/modules/bookings/models.py`

**Current BookingCreate Model:**
```python
class BookingCreate(BaseModel):
    profile_id: str
    service_id: Optional[str] = None
    booking_date: datetime
    notes: Optional[str] = None
    # MISSING: time_slot field
```

**Issue:** Backend doesn't have a `time_slot` field in BookingCreate model. This needs to be added for the backend to:
1. Associate bookings with specific time slots
2. Increment the booked_count for that slot
3. Enforce capacity limits

---

## Proposed Changes

### Phase 1: Backend Enhancement (Required First)

#### Update Backend Booking Model
**File:** `backend/modules/bookings/models.py`

**Add time_slot field:**
```python
class BookingCreate(BaseModel):
    profile_id: str
    service_id: Optional[str] = None
    booking_date: datetime
    time_slot: Optional[str] = None  # NEW: "09:00-10:00"
    notes: Optional[str] = None
```

#### Update Backend Booking Creation Logic
**File:** `backend/modules/bookings/routes.py` or `repository.py`

**Add logic to:**
1. When booking is created with a `time_slot`, find the corresponding availability slot
2. Check if slot is available (booked_count < max_capacity)
3. Increment booked_count for that slot
4. Store time_slot in booking record
5. On booking cancellation, decrement booked_count

---

### Phase 2: Frontend Time Slot Selection

#### Step 1: Update Frontend Booking Types
**File:** `src/types/index.ts`

**Update BookingCreate:**
```typescript
export interface BookingCreate {
  profile_id: string;
  service_id?: string;
  booking_date: string;
  time_slot?: string;  // NEW
  notes?: string;
}
```

#### Step 2: Create TimeSlotPicker Component
**New File:** `src/components/TimeSlotPicker.tsx`

**Purpose:** Display available time slots for a selected date

**Features:**
- Show list of time slots for selected date
- Display remaining capacity per slot
- Highlight selected slot
- Disable fully booked slots
- Show loading state while fetching
- Show empty state if no slots available

**Props:**
```typescript
interface TimeSlotPickerProps {
  profileId: string;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (timeSlot: string | null) => void;
}
```

**UI Design:**
```
┌─────────────────────────────────┐
│ Available Time Slots            │
├─────────────────────────────────┤
│ ☐ 09:00 - 10:00    (2/5 spots)  │
│ ☑ 10:00 - 11:00    (1/5 spots)  │ ← Selected
│ ☐ 11:00 - 12:00    (5/5 spots)  │ ← Disabled (full)
│ ☐ 13:00 - 14:00    (0/5 spots)  │
└─────────────────────────────────┘
```

**Sample Implementation:**
```tsx
export default function TimeSlotPicker({ profileId, selectedDate, selectedTimeSlot, onTimeSlotChange }: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate || !profileId) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const response = await availabilityAPI.getSlotsForDate(
          profileId,
          selectedDate.toISOString()
        );
        setSlots(response.data.slots);
      } catch (error) {
        console.error('Failed to fetch time slots:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, profileId]);

  if (!selectedDate) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Please select a date first
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm">Loading time slots...</div>;
  }

  if (slots.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No time slots available for this date
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map(slot => {
        const isFull = slot.booked_count >= slot.max_capacity;
        const isSelected = selectedTimeSlot === slot.time_slot;
        const remaining = slot.max_capacity - slot.booked_count;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={isFull}
            onClick={() => onTimeSlotChange(slot.time_slot)}
            className={`
              w-full p-3 rounded-lg border text-left transition-colors
              ${isFull 
                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
                : isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                {slot.time_slot}
              </span>
              <span className={`text-sm ${isFull ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                {isFull ? 'Full' : `${remaining} ${remaining === 1 ? 'spot' : 'spots'} left`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

#### Step 3: Update Booking Page
**File:** `src/app/profiles/[profileId]/page.tsx`

**Changes Required:**

**1. Add State for Time Slot:**
```typescript
const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
```

**2. Add TimeSlotPicker After Date Selection (around line 279):**
```tsx
{/* Date Selection */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Preferred Date
  </label>
  <Calendar
    selectedDate={bookingDate}
    onDateChange={setBookingDate}
    minDate={new Date()}
  />
</div>

{/* Time Slot Selection - NEW */}
{bookingDate && (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Select Time Slot
    </label>
    <TimeSlotPicker
      profileId={profileId}
      selectedDate={bookingDate}
      selectedTimeSlot={selectedTimeSlot}
      onTimeSlotChange={setSelectedTimeSlot}
    />
  </div>
)}
```

**3. Update Submit Handler to Include Time Slot:**
```typescript
const handleBookingSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!profile || !bookingDate) return;
  
  try {
    setBookingLoading(true);
    
    const bookingData: BookingCreate = {
      profile_id: profile.id,
      service_id: selectedService || undefined,
      booking_date: bookingDate.toISOString(),
      time_slot: selectedTimeSlot || undefined,  // NEW
      notes: notes || undefined,
    };
    
    const response = await bookingsAPI.create(bookingData);
    // ... success handling
  }
}
```

**4. Update Submit Button Validation:**
```tsx
<button
  type="submit"
  disabled={bookingLoading || !bookingDate || !selectedTimeSlot}  // NEW: require time slot
  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
```

**5. Reset Time Slot When Date Changes:**
```typescript
// Add useEffect to reset time slot when date changes
useEffect(() => {
  setSelectedTimeSlot(null);
}, [bookingDate]);
```

**6. Update Confirmation Modal to Include Time Slot:**
```tsx
<BookingConfirmationModal
  isOpen={isModalOpen}
  onClose={handleModalClose}
  bookingData={{
    booking_ref: bookingReference.booking_ref,
    booking_id: bookingReference.booking_id,
    booking_date: confirmedBookingDate,
    time_slot: selectedTimeSlot,  // NEW
    profile_name: profile.name,
    service_name: selectedService && profile.services?.find(s => s.id === selectedService)?.title
  }}
/>
```

---

### Phase 3: Enhanced Calendar Integration (Optional)

#### Option A: Show Availability on Calendar
Enhance the Calendar component to show which dates have availability:

**Fetch monthly availability on mount:**
```typescript
const [monthlyAvailability, setMonthlyAvailability] = useState<DateAvailability[]>([]);

useEffect(() => {
  const fetchAvailability = async () => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    
    const response = await availabilityAPI.getAvailability(
      profileId,
      start.toISOString(),
      end.toISOString()
    );
    setMonthlyAvailability(response.data);
  };
  
  fetchAvailability();
}, [profileId]);
```

**Add visual indicators to Calendar:**
- Green dot: Dates with available slots
- Yellow dot: Dates with limited availability
- Red/disabled: Dates with no availability

#### Option B: Disable Unavailable Dates
Pass dates with no availability to Calendar's `disabledDates` prop:

```typescript
const disabledDates = useMemo(() => {
  // Return dates that have 0 available_slots
  return monthlyAvailability
    .filter(day => day.available_slots === 0)
    .map(day => new Date(day.date));
}, [monthlyAvailability]);

<Calendar
  selectedDate={bookingDate}
  onDateChange={setBookingDate}
  minDate={new Date()}
  disabledDates={disabledDates}  // NEW
/>
```

---

## Implementation Order

### Required (Must Do):
1. ✅ **Backend First** - Update booking model and logic to support time_slot field
2. ✅ Create TimeSlotPicker component
3. ✅ Update booking page with time slot selection
4. ✅ Update frontend types (BookingCreate with time_slot)

### Optional (Nice to Have):
5. ⏳ Enhance calendar to show availability indicators
6. ⏳ Disable dates with no availability
7. ⏳ Show loading states during slot fetching

---

## Testing Checklist

### Backend Testing:
- [ ] Booking created with time_slot correctly increments slot booked_count
- [ ] Cannot book slot when booked_count >= max_capacity
- [ ] Canceling booking decrements booked_count
- [ ] Booking without time_slot still works (for backwards compatibility)

### Frontend Testing:
- [ ] Time slots load when date is selected
- [ ] Fully booked slots are disabled
- [ ] Selected time slot is highlighted
- [ ] Cannot submit without selecting time slot
- [ ] Time slot resets when date changes
- [ ] Confirmation modal shows selected time slot
- [ ] Empty state shows when no slots available for date

---

## Dependencies

**No new dependencies required** - Uses existing:
- `availabilityAPI` (already implemented)
- `date-fns` (already installed)
- Existing UI components and styling

---

## Known Limitations

1. **Backend Dependency:** Backend must be updated first to support time_slot field
2. **Backwards Compatibility:** Need to ensure bookings without time_slot still work
3. **Race Conditions:** Multiple users booking same slot simultaneously (backend should handle with atomic operations)
4. **Real-time Updates:** Availability doesn't update in real-time (user must refresh)

---

## Estimated Effort

**Backend Changes:** 2-3 hours
- Update booking model
- Add slot increment/decrement logic
- Test capacity enforcement

**Frontend Changes:** 3-4 hours
- Create TimeSlotPicker component
- Update booking page
- Update types
- Test booking flow

**Total:** ~5-7 hours

---

**Status:** Ready for approval and implementation
**Priority:** High (core feature for availability system)
**Risk Level:** Medium (requires backend changes)

# Landing Page Editor Implementation Plan

## Overview

Create a comprehensive Landing Page Editor in the Admin dashboard that allows business owners to customize their public-facing landing page in the frontend application.

## Project Context

- **Admin App**: `/Booking/admin` - Next.js admin dashboard
- **Frontend App**: `/Booking/frontend` - Public-facing customer site  
- **Backend**: `/Booking/backend` - FastAPI backend with MongoDB

## Key Constraint

**Book Now buttons are MANDATORY and cannot be removed.** The CTA buttons must:
1. Always exist in hero section and final CTA section
2. Always link to `/book` (link is NOT configurable, hardcoded in frontend)
3. Only allow customization of: text, style, size

## Current Frontend Landing Page Structure

The landing page (`frontend/src/app/page.tsx`) consists of these sections:

1. **HeroSection** - Hero banner with title, subtitle, CTA button, background image
2. **ServicesShowcase** - Service cards (already dynamic from API)
3. **PortfolioGallery** - Gallery grid with images
4. **StatsBar** - Social proof statistics
5. **Testimonials** - Customer testimonial cards
6. **FinalCTA** - Bottom call-to-action section
7. **Footer** - Business info, hours, social links

## Phase 1: Backend (COMPLETED)

Created `/Booking/backend/modules/landing/` with:
- `models.py` - Pydantic models for all landing page sections
- `repository.py` - MongoDB CRUD operations
- `routes.py` - API endpoints

### API Endpoints
- `GET /landing/config` - Get owner's config (protected)
- `PUT /landing/config` - Update config (protected)
- `POST /landing/config/publish` - Publish changes (protected)
- `GET /landing/public` - Get published config (public, no auth)

### Data Models

```python
CTAButtonConfig:
  - text: str (2-30 chars, default "Book Now")
  - style: "solid" | "outline" | "gradient"
  - size: "default" | "large"

HeroSection:
  - title: str
  - subtitle: str
  - background_image_url: str
  - cta_button: CTAButtonConfig (REQUIRED)

PortfolioItem:
  - id, image_url, title, alt_text

SocialStat:
  - id, value, label, platform

Testimonial:
  - id, quote, name, title

FooterConfig:
  - business_name, address, phone, hours[], social_links

FinalCTASection:
  - title, subtitle, background_style
  - cta_button: CTAButtonConfig (REQUIRED)

BrandingConfig:
  - primary_color, dark_bg_color, light_bg_color, logo_url

LandingPageConfig:
  - hero, services_section, portfolio_section, portfolio_items[]
  - stats_section, stats[], testimonials_section, testimonials[]
  - final_cta, footer, branding
  - is_published, created_at, updated_at
```

## Phase 2: Frontend API Integration

### Files to Modify

1. **`frontend/src/services/api.ts`**
   - Add `landingAPI.getPublicConfig()` method

2. **`frontend/src/app/page.tsx`**
   - Fetch config from `/landing/public` on mount
   - Pass config to child components
   - Show loading state while fetching

3. **`frontend/src/components/home/HeroSection.tsx`**
   - Accept config prop
   - Use config values with fallbacks to current hardcoded values
   - CTA button always renders, links to `/book` (hardcoded)

4. **`frontend/src/components/home/PortfolioGallery.tsx`**
   - Accept portfolio items from config
   - Fallback to current hardcoded items

5. **`frontend/src/components/home/StatsBar.tsx`**
   - Accept stats from config
   - Fallback to current hardcoded stats

6. **`frontend/src/components/home/Testimonials.tsx`**
   - Accept testimonials from config
   - Fallback to current hardcoded testimonials

7. **`frontend/src/components/home/FinalCTA.tsx`**
   - Accept config prop
   - CTA button always renders, links to `/book` (hardcoded)

8. **`frontend/src/components/Footer.tsx`**
   - Accept footer config
   - Fallback to current hardcoded values

### Important: Graceful Fallbacks

All components must continue working if API fails:
```typescript
const config = apiConfig || defaultConfig;
```

## Phase 3: Admin Landing Page Editor

### New Files to Create

#### Main Page
- `admin/src/app/(dashboard)/landing-editor/page.tsx`

#### Editor Components
- `admin/src/components/landing-editor/HeroEditor.tsx`
- `admin/src/components/landing-editor/PortfolioEditor.tsx`
- `admin/src/components/landing-editor/StatsEditor.tsx`
- `admin/src/components/landing-editor/TestimonialsEditor.tsx`
- `admin/src/components/landing-editor/FinalCTAEditor.tsx`
- `admin/src/components/landing-editor/FooterEditor.tsx`
- `admin/src/components/landing-editor/BrandingEditor.tsx`
- `admin/src/components/landing-editor/CTAButtonEditor.tsx`
- `admin/src/components/landing-editor/ImageUploader.tsx`
- `admin/src/components/landing-editor/ColorPicker.tsx`
- `admin/src/components/landing-editor/EditorTabs.tsx`
- `admin/src/components/landing-editor/PreviewModal.tsx`

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Landing Page Editor                                         │
│ Customize your public-facing landing page                   │
│                                                             │
│ [Preview] [Save Draft] [Publish Changes]                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tabs: [Hero] [Portfolio] [Stats] [Testimonials]            │
│        [Final CTA] [Footer] [Branding]                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  Section-specific editor form                       │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Editable Content Per Section

#### Hero Section
- Title (text input, max 100 chars)
- Subtitle (text input, max 200 chars)
- Background image (URL input or file upload)
- CTA Button (text, style, size) - CANNOT REMOVE

#### Portfolio Gallery
- Section title and subtitle
- Add/edit/remove images (max 8)
- Each image: URL, title, alt text
- Drag to reorder

#### Stats Bar
- Section title and subtitle
- Add/edit/remove stats (max 6)
- Each stat: value, label, platform (for icon)

#### Testimonials
- Section title and subtitle
- Add/edit/remove testimonials (max 6)
- Each: quote, name, title/role

#### Final CTA
- Title and subtitle
- Background style (default/accent/gradient)
- CTA Button (text, style, size) - CANNOT REMOVE

#### Footer
- Business name
- Address (multiline)
- Phone number
- Opening hours (list)
- Social media links (Instagram, Facebook, Twitter, YouTube)

#### Branding
- Primary accent color (color picker)
- Dark background color
- Light background color
- Logo URL

### CTA Button Editor Component

```typescript
interface CTAButtonEditorProps {
  config: CTAButtonConfig;
  onChange: (config: CTAButtonConfig) => void;
  label?: string;
}

// Features:
// - Text input (required, 2-30 chars)
// - Style selector with visual preview
// - Size selector
// - Live button preview
// - NO delete/remove option
// - Shows info: "Links to: /book (cannot be changed)"
```

### Sidebar Navigation Update

Modify `admin/src/components/layout/Sidebar.tsx`:
- Add "Landing Page" nav item
- Position between "Services" and "Customers"
- Icon: Layout/grid icon

```typescript
{
  name: 'Landing Page',
  href: '/landing-editor',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-6z" />
    </svg>
  ),
}
```

## Phase 4: API Integration for Admin

### Add to `admin/src/services/api.ts`

```typescript
export const landingAPI = {
  getConfig: () => api.get('/landing/config'),
  updateConfig: (data: LandingPageConfigUpdate) => api.put('/landing/config', data),
  publish: () => api.post('/landing/config/publish'),
  unpublish: () => api.post('/landing/config/unpublish'),
};
```

### Add Types to `admin/src/types/index.ts`

Add all TypeScript interfaces matching the backend Pydantic models.

## Dependencies

### Admin Frontend (to install)
```bash
cd Booking/admin
npm install react-colorful
```

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Image storage not configured | Use external URLs initially |
| Large file uploads | Client-side validation (max 5MB) |
| Breaking frontend changes | Graceful fallbacks to hardcoded values |
| Data loss during editing | Auto-save drafts, warn on navigation |
| CTA removal attempts | Backend enforces constraints, no UI option |

## Testing Checklist

### Backend
- [ ] GET /landing/config returns default for new users
- [ ] PUT /landing/config enforces CTA constraints
- [ ] GET /landing/public works without auth
- [ ] CTA buttons always present in response

### Frontend
- [ ] Page loads with API config
- [ ] Page loads with fallback when API fails
- [ ] CTA buttons always link to /book
- [ ] Styling from branding config applies

### Admin
- [ ] All tabs render correctly
- [ ] Form validation works
- [ ] Save/publish flow works
- [ ] Preview shows accurate representation
- [ ] Cannot remove CTA buttons

## Estimated Effort

- Phase 2 (Frontend Integration): 6-8 hours
- Phase 3 (Admin Editor): 20-25 hours
- Phase 4 (Admin API): 2-3 hours
- Testing: 4-6 hours
- **Total Remaining**: 32-42 hours

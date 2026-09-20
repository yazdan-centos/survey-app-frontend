# Admin Layout Implementation

This document describes the new admin layout with a responsive sidebar navigation system optimized for RTL (Right-to-Left) Persian layout.

## Overview

The admin section features a **right-side** sidebar navigation (visually) with smooth animations, hover effects, and full responsive support for RTL layout.

## Important: RTL Layout

This application uses RTL (right-to-left) layout for Persian language. In RTL:
- **Visual right = `left` in code**
- **Visual left = `right` in code**
- The sidebar appears on the **right side visually** but uses `left-0` in CSS
- All directional properties are reversed

See [RTL_LAYOUT_GUIDE.md](RTL_LAYOUT_GUIDE.md) for detailed explanation.

## Components

### 1. AdminLayout (`src/components/layout/AdminLayout.jsx`)

Main layout wrapper for all admin pages featuring:
- **Responsive Design**: Sidebar is fixed on mobile (toggleable) and static on desktop (lg+)
- **Right-side positioning (RTL)**: Sidebar appears on the right side visually
- **Mobile menu**: Hamburger menu button to toggle sidebar on small screens
- **Overlay**: Semi-transparent backdrop when sidebar is open on mobile
- **Smooth transitions**: 300ms ease-in-out animations

**Key RTL Adjustments:**
- Uses `left-0` to position on visual right
- Uses `border-r` for visual left border
- Uses `flex-row` for proper RTL order
- Uses `-translate-x-full` to hide towards visual left

### 2. AdminSidebar (`src/components/layout/AdminSidebar.jsx`)

Navigation sidebar component with:
- **7 Navigation Items**:
  1. داشبورد (Dashboard) - `/dashboard`
  2. مدیریت پیمایش‌ها (Surveys Management) - `/admin/surveys`
  3. بانک سؤالات (Questions Bank) - `/admin/questions`
  4. کاربران (Users) - `/admin/users`
  5. پاسخ‌نامه‌ها (Responses) - `/admin/responses`
  6. گزارش‌گیری (Reports) - `/admin/reports`
  7. تنظیمات (Settings) - `/admin/settings`

#### Features:

**Active State:**
- Gradient background (primary-800 to primary-700) flowing right-to-left
- White text with bold font
- Shadow effect with primary color
- Animated chevron indicator (ChevronRight for RTL)
- White border accent on the right edge (visually)

**Hover Effects:**
- Smooth background color transition to slate-50
- Text color changes to primary-700
- Icon scales up 110% (transform animation)
- Description text fades in
- Border accent appears on the right edge (visually)
- Shadow effect appears

**Visual Elements:**
- Icon with dynamic stroke width (2.5 for active, 2 for inactive)
- Label text with truncation for long names
- Description text that appears on hover/active
- Animated right border accent (visually)
- Pulsing chevron for active items (pointing left in RTL)

**RTL Adjustments:**
- Uses `ChevronRight` icon (points left visually in RTL)
- Uses `bg-gradient-to-r` (flows left visually in RTL)
- Border accent uses `left-0 rounded-l-xl` (right edge visually)

### 3. Updated Header (`src/components/layout/Header.jsx`)

Simplified header:
- Removed admin navigation (now in sidebar)
- Increased max-width to 7xl for better layout
- Cleaner, focused design

### 4. Updated App.jsx

Routing structure:
```jsx
<Route element={<AdminGuard />}>
  <Route element={<AdminLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/admin/surveys" element={<AdminSurveysPage />} />
    <Route path="/admin/questions" element={<AdminQuestionsPage />} />
    <Route path="/admin/users" element={...} />
    <Route path="/admin/responses" element={...} />
    <Route path="/admin/reports" element={...} />
    <Route path="/admin/settings" element={...} />
  </Route>
</Route>
```

## Design System Alignment

### Colors Used:
- **Primary-800** (#9E0B0F): Active background gradient start, icon hover
- **Primary-700** (#C4161C): Active background gradient end, text hover
- **Primary-600**: Border accent on hover
- **Primary-100**: Description text on active items
- **Slate-50/100/200**: Backgrounds and borders
- **Slate-500/700/900**: Text colors

### Animations:
- `transition-all duration-200`: Smooth state changes
- `transition-transform duration-200`: Icon scaling
- `transition-opacity duration-200`: Description fade
- `animate-pulse`: Chevron indicator
- `group-hover`: Parent-triggered child animations

### Responsive Breakpoints:
- **Mobile (< 1024px)**: Fixed sidebar with toggle, overlay backdrop
- **Desktop (≥ 1024px)**: Static sidebar, always visible on right side (visually)

## Usage

All admin pages automatically get the sidebar layout. No changes needed to individual page components.

For new admin pages:
1. Create the page component
2. Add route to App.jsx inside `<AdminLayout />`
3. Add navigation item to `navigationItems` array in AdminSidebar.jsx

## Visual Layout

```
Desktop (RTL Layout):
┌────────────────────────────────────────────────────┐
│              Header (Full Width)                   │
└────────────────────────────────────────────────────┘
┌──────────────────────────────┬─────────────────────┐
│                              │   پنل مدیریت        │
│   Main Content               │   ──────────────    │
│   (Visual Left)              │   • داشبورد         │
│                              │   • مدیریت پیمایش‌ها │
│   Page content renders here  │   • بانک سؤالات     │
│                              │   • کاربران         │
│                              │   • پاسخ‌نامه‌ها      │
│                              │   • گزارش‌گیری       │
│                              │   • تنظیمات          │
│                              │                     │
└──────────────────────────────┴─────────────────────┘
```

## Testing Checklist

- [x] Desktop view - sidebar visible on **right side** (visually)
- [x] Mobile view - sidebar hidden by default
- [x] Mobile menu toggle works
- [x] Overlay closes sidebar when clicked
- [x] Active state styling correct
- [x] Hover effects working smoothly
- [x] Icon animations working
- [x] Description text fades in/out
- [x] Chevron indicator pulses on active and points correct direction
- [x] Border accent animates on **right edge** (visually)
- [x] RTL layout correct for Persian text
- [x] All navigation links route correctly
- [x] Gradient flows from right to left (visually)

## Future Enhancements

- Add badge notifications to nav items
- Add collapsible sidebar option
- Add user profile section in sidebar footer
- Add keyboard navigation support (with RTL arrow key handling)
- Add breadcrumb navigation
- Add search functionality in sidebar
# Calendar Event Sidebar - Component Structure

This document outlines the refactored component structure for the calendar event sidebar.

## Overview

The original `AddEventSidebar.tsx` component was a large, monolithic component with over 1,300 lines of code. It has been refactored into multiple smaller, focused components for better maintainability, readability, and reusability.

## File Structure

```
src/views/apps/calendar/
├── AddEventSidebar.tsx          # Main sidebar component (orchestrates all components)
├── types.ts                     # Shared TypeScript types and interfaces
└── components/
    ├── index.ts                 # Component exports
    ├── EventHeroSection.tsx     # Event title and badges display
    ├── EventDetailsCards.tsx    # Event information cards (schedule, instructor, description, status)
    ├── EventMeetingLink.tsx     # Meeting link display with join button
    ├── EventView.tsx            # View mode container (combines hero, meeting link, and details)
    ├── EventForm.tsx            # Form for creating/editing events
    ├── SidebarHeader.tsx        # Sidebar header with title and action buttons
    └── SidebarFooter.tsx        # Sidebar footer with action buttons
```

## Component Responsibilities

### `AddEventSidebar.tsx` (Main Component)

- Orchestrates all child components
- Manages state and business logic
- Handles event submission and data transformation
- Provides the main Drawer container

### `types.ts`

- Defines all shared TypeScript interfaces
- Exports default form state
- Centralizes type definitions for consistency

### `SidebarHeader.tsx`

- Displays the sidebar title (Add Event, Edit Event, Event Details)
- Shows action buttons (Edit, Delete, Cancel, Close)
- Handles role-based button visibility

### `SidebarFooter.tsx`

- Displays action buttons based on current state
- Handles different button sets for Add/Edit/View modes
- Consistent button styling and interactions

### `EventHeroSection.tsx`

- Displays event title with gradient background
- Shows event type badges (Virtual/In-Person, Recurring, Price)
- Includes decorative background elements

### `EventMeetingLink.tsx`

- Displays meeting link with prominent join button
- Shows the actual meeting URL
- Handles external link opening

### `EventDetailsCards.tsx`

- Displays event information in card format
- Shows schedule, instructor, description, and status
- Implements hover effects and consistent styling

### `EventView.tsx`

- Combines hero section, meeting link, and details cards
- Provides the complete view mode experience
- Handles the view mode footer

### `EventForm.tsx`

- Contains all form inputs for creating/editing events
- Handles form validation and state management
- Supports both simple and recurring event creation

## Benefits of Refactoring

### 1. **Maintainability**

- Each component has a single, clear responsibility
- Easier to locate and fix bugs
- Simpler to understand individual components

### 2. **Reusability**

- Components can be reused in other parts of the application
- EventHeroSection, EventDetailsCards, etc. can be used in other event-related pages

### 3. **Testability**

- Each component can be tested independently
- Easier to write unit tests for specific functionality
- Better test coverage possibilities

### 4. **Development Experience**

- Smaller files are easier to navigate
- Reduced cognitive load when working on specific features
- Better IDE performance with smaller files

### 5. **Team Collaboration**

- Multiple developers can work on different components simultaneously
- Reduced merge conflicts
- Clearer code ownership

## Usage

The refactored sidebar maintains the same external API. Import and use it exactly as before:

```tsx
import AddEventSidebar from 'src/views/apps/calendar/AddEventSidebar'

// Usage remains the same
;<AddEventSidebar
  store={store}
  dispatch={dispatch}
  addEvent={addEvent}
  updateEvent={updateEvent}
  // ... other props
/>
```

## Key Features Preserved

- ✅ Role-based edit access (Professor/Admin only)
- ✅ View mode by default for existing events
- ✅ Modern, card-based design
- ✅ Gradient styling and micro-interactions
- ✅ Meeting link integration with join button
- ✅ Recurring event support
- ✅ Form validation
- ✅ Responsive design
- ✅ All existing functionality

## Future Enhancements

With this modular structure, future enhancements become easier:

1. **Add new event types**: Create new card components
2. **Enhance form validation**: Modify only the EventForm component
3. **Add new view modes**: Create additional view components
4. **Improve styling**: Update individual components without affecting others
5. **Add animations**: Implement in specific components without complexity

## Migration Notes

- No breaking changes to the external API
- All existing props and callbacks work as before
- Component behavior remains identical
- Styling and user experience preserved

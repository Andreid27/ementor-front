# Assignment Modal - Requirements & Design Plan

> **Updated Design Focus**: This document specifies a generic, reusable assignment modal built around **two dynamic lists**: a flexible entity selector and a hierarchical grouped user selector. The component supports any assignable entity type (lessons, quizzes, invoices, etc.) with optional configuration fields.

## 📋 Overview

A highly reusable, generic modal component featuring **two dynamic lists**:

1. **Entity List** (List #1): A multi-select list of assignable objects (lessons, quizzes, invoices, etc.)
2. **Grouped User List** (List #2): Users organized by recurring series with hierarchical selection

This component handles assigning any type of entity to users while maintaining flexibility and reusability.

### Key Design Principles

✅ **Generic & Reusable**: Works with any entity type via TypeScript generics  
✅ **Data via Props**: No internal data fetching - parent provides all data  
✅ **Two-List Structure**: Clear separation between entities and users  
✅ **Hierarchical Selection**: Group-level and individual-level user selection  
✅ **Type-Safe**: Full TypeScript support with proper typing  
✅ **Optional Configuration**: Assignment fields are optional and dynamic  

### Visual Structure

```
┌─────────────────────────────────────────────────────┐
│              Asignează [Entity Type]                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  LIST #1: Select Entities                          │
│  ┌─────────────────────────────────────────────┐  │
│  │ [Chip] [Chip] [Chip]                        │  │
│  │ Search and select entities...               │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  LIST #2: Select Users (Grouped by Series)         │
│  ┌─────────────────────────────────────────────┐  │
│  │ ▼ [ ] Series 1 (5 users)                    │  │
│  │   [ ] 👤 User 1                             │  │
│  │   [ ] 👤 User 2                             │  │
│  │                                               │  │
│  │ ▶ [ ] Series 2 (3 users)                    │  │
│  │                                               │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Assignment Configuration (Optional)                │
│  ┌─────────────────────────────────────────────┐  │
│  │ [DateTime] [Checkbox] [Other fields...]     │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│                         [Cancel]  [Assign]          │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Reference: The Two-List Structure

This component is built around **two independent, configurable lists**:

### List #1: Entity Selection (What to Assign)

**Purpose**: Select items to assign (lessons, quizzes, invoices, etc.)

- **Type**: Generic multi-select autocomplete
- **Data Source**: Passed via `entities` prop
- **Configuration**: Via `EntityConfig` object
- **UI**: Chip-based selection with search
- **Example**: Select 3 lessons to assign

### List #2: Grouped User Selection (Who to Assign To)

**Purpose**: Select users organized by recurring series

- **Type**: Hierarchical grouped selector
- **Data Source**: Passed via `users` + `recurringSeries` props
- **Grouping**: Users grouped by `RecurringSeriesDTO`
- **Selection Modes**: Group-level OR individual-level
- **UI**: Accordion groups with checkboxes
- **Example**: Select all users from "Math Series A" + 2 individual users from "Math Series B"

### Assignment Flow

```typescript
1. User selects entities from List #1     → [Lesson A, Lesson B]
2. User selects users from List #2        → [Group: Series 1 (all), Individual: User X, User Y]
3. Optional: Configure assignment options → [startAfter: Date, isVisible: true]
4. Click "Assign"                         → onAssign({ entities, users, options })
```

### Data Flow Diagram

```
Parent Component
    │
    ├─→ Fetches entities (lessons/quizzes/etc.)
    ├─→ Fetches users
    ├─→ Fetches recurring series
    │
    ├─→ Prepares EntityConfig
    ├─→ Prepares AssignmentConfig (optional)
    │
    └─→ Passes to GenericAssignmentModal
            │
            ├─→ List #1: EntitySelector
            │       └─→ User selects entities
            │
            ├─→ List #2: GroupedUserSelector
            │       ├─→ Groups users by series
            │       └─→ User selects users/groups
            │
            ├─→ AssignmentConfigForm (optional)
            │       └─→ User configures options
            │
            └─→ onAssign callback
                    └─→ Parent handles API call
```

---

## 🎯 Core Requirements Summary

### Comparison: Current vs. New Design

| Aspect | Current Implementation | New Design |
|--------|------------------------|------------|
| **Entity Type Support** | Hardcoded for lessons only | Generic - any entity type |
| **Data Fetching** | Internal (useEffect) | External (via props) |
| **User Grouping** | Flat list | Grouped by recurring series |
| **Selection Model** | Simple checkboxes | Hierarchical (group + individual) |
| **Configuration** | Fixed fields | Dynamic, optional fields |
| **Reusability** | Lesson-specific | Fully reusable for any entity |
| **Type Safety** | Basic TypeScript | Full generics support |
| **Location** | `src/pages/student-lessons/` | `src/@core/components/assignment/` |

### The Two Lists in Detail

#### **List #1: Dynamic Entity Selection**

A generic, multi-select list that supports any type of assignable object.

#### Current State
- Hardcoded for lessons only
- Fetches data internally
- Fixed display logic

#### Required State
- **Generic Type Support**: Works with any entity type (Lesson, Quiz, Invoice, etc.)
- **Props-Based Data**: All entities passed as props (no internal fetching)
- **Flexible Display**: Configurable labels, display properties, and rendering
- **Search & Filter**: Built-in search functionality
- **Chip-Based Selection**: Selected items displayed as chips
- **Bulk Selection**: Optional "Select All" functionality

#### Key Features
```typescript
// Generic entity - any object with at least an 'id'
interface AssignableEntity {
  id: string
  [key: string]: any  // Supports any additional properties
}

// Configuration for how to display entities
interface EntityConfig {
  displayProperty: string | ((entity: any) => string)
  secondaryProperty?: string | ((entity: any) => string)
  labelSingular: string    // "Lesson", "Quiz", "Invoice"
  labelPlural: string      // "Lessons", "Quizzes", "Invoices"
  searchPlaceholder?: string
  chipColor?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
}
```

---

### 2. **List #2: Grouped User Selection**
An advanced user selector with hierarchical grouping by recurring series.

#### Current State
- Flat list of users
- No grouping
- Simple checkbox selection

#### Required State
- **Series Grouping**: Users organized by `RecurringSeriesDTO`
- **Hierarchical Selection**: Select entire groups OR individual users
- **Multi-Membership**: Users can appear in multiple groups
- **Visual Hierarchy**: Clear parent-child relationship
- **Group Actions**: Expand/collapse, select all per group
- **Search Within Groups**: Filter users across all groups

#### Key Features
- **Group Header**: Series name, pattern, user count, "Select All" checkbox
- **User Items**: Avatar, name, individual checkbox
- **Selection States**: 
  - None selected (empty checkbox)
  - Some selected (indeterminate checkbox)
  - All selected (checked checkbox)
- **Visual Indicators**: Color coding per series, badges for counts

---

### 3. **Assignment Configuration**
Optional configuration section for assignment-specific settings.

#### Current State
- Fixed fields: datetime, visibility checkbox
- Hardcoded for lessons

#### Required State
- **Optional Section**: Can be hidden if not needed
- **Dynamic Fields**: Passed via props, rendered dynamically
- **Validation**: Per-field validation rules
- **Default Values**: Support for pre-populated values

---

### 4. **Reusability & Decoupling**
- **No Business Logic**: Pure presentation component
- **No API Calls**: All data via props
- **Type-Safe**: Full TypeScript support with generics
- **Location**: `src/@core/components/assignment/`
- **Composition**: Smaller, focused sub-components

---

## 🏗️ Component Architecture

### The Two-List Structure

```
GenericAssignmentModal
├── List #1: EntitySelector
│   └── Multi-select autocomplete with chip display
│
├── List #2: GroupedUserSelector  
│   ├── Series Group 1 (Collapsible)
│   │   ├── Group Header (Checkbox + Series Info)
│   │   └── User List (Individual checkboxes)
│   ├── Series Group 2 (Collapsible)
│   │   └── ...
│   └── Series Group N
│
├── AssignmentConfigForm (Optional)
│   └── Dynamic fields based on entity type
│
└── Actions (Cancel / Assign)
```

---

## 📐 Component API

### **GenericAssignmentModal** (Main Component)

The container component that orchestrates both lists and handles assignment logic.

#### Props Interface
```typescript
interface GenericAssignmentModalProps<T extends AssignableEntity> {
  // ========================================
  // LIST #1: Entity Configuration
  // ========================================
  entities: T[]                           // The objects to assign (lessons, quizzes, etc.)
  entityConfig: EntityConfig              // How to display these entities
  
  // ========================================
  // LIST #2: User & Grouping Configuration
  // ========================================
  users: UserDTO[]                        // All available users
  recurringSeries: RecurringSeriesDTO[]   // Series for grouping users
  
  // ========================================
  // Assignment Configuration (Optional)
  // ========================================
  assignmentConfig?: AssignmentConfig     // Optional configuration fields
  defaultAssignmentOptions?: Record<string, any>
  
  // ========================================
  // Callbacks
  // ========================================
  onAssign: (assignment: AssignmentPayload<T>) => Promise<void>
  onValidate?: (data: ValidationData<T>) => ValidationResult
  
  // ========================================
  // Modal Control & UI
  // ========================================
  open?: boolean
  onClose?: () => void
  triggerButton?: React.ReactNode
  modalTitle?: string
  modalSize?: 'sm' | 'md' | 'lg' | 'xl'
  confirmButtonText?: string
  cancelButtonText?: string
}
```

#### Core Types

```typescript
// ========================================
// LIST #1 TYPES: Entity Configuration
// ========================================

// Any assignable object must have at least an 'id'
interface AssignableEntity {
  id: string
  [key: string]: any  // Supports any additional properties
}

// Configures how entities are displayed in List #1
interface EntityConfig {
  displayProperty: string | ((entity: any) => string)  // Primary label
  secondaryProperty?: string | ((entity: any) => string)  // Optional subtitle
  labelSingular: string    // "Lesson", "Quiz", "Invoice"
  labelPlural: string      // "Lessons", "Quizzes", "Invoices"
  searchPlaceholder?: string  // "Search lessons..."
  chipColor?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
}

// ========================================
// LIST #2 TYPES: Grouped User Selection
// ========================================

// Represents a selected user with context
interface SelectedUser {
  userId: string
  userInfo: UserDTO
  seriesId?: string           // Set if selected via series group
  seriesInfo?: RecurringSeriesDTO
}

// ========================================
// ASSIGNMENT CONFIGURATION (Optional)
// ========================================

// Optional configuration for assignment-specific fields
interface AssignmentConfig {
  fields: AssignmentField[]
}

interface AssignmentField {
  key: string
  type: 'datetime' | 'boolean' | 'text' | 'number' | 'select' | 'custom'
  label: string
  required?: boolean
  defaultValue?: any
  customComponent?: React.ComponentType<any>
  options?: { label: string; value: any }[]  // For select type
  validation?: (value: any) => string | undefined
}

// ========================================
// ASSIGNMENT PAYLOAD
// ========================================

// Data sent to onAssign callback
interface AssignmentPayload<T extends AssignableEntity> {
  entities: T[]                           // Selected entities from List #1
  users: SelectedUser[]                   // Selected users from List #2
  options: Record<string, any>            // Assignment configuration values
}

// Validation for assignment data
interface ValidationData<T extends AssignableEntity> {
  entities: T[]
  users: SelectedUser[]
  options: Record<string, any>
}

interface ValidationResult {
  isValid: boolean
  errors?: {
    field: string
    message: string
  }[]
}
```

---

## 📋 Sub-Component Specifications

### **List #1: EntitySelector**

A generic multi-select component for choosing assignable objects.

**Purpose**: Display and select entities (lessons, quizzes, invoices, etc.) with search and chip-based UI.

**Key Features**:

- Material-UI `Autocomplete` with multiple selection
- Chip display for selected items
- Search/filter functionality
- Configurable display via `EntityConfig`
- Support for any entity type via generics

**Props**:

```typescript
interface EntitySelectorProps<T extends AssignableEntity> {
  entities: T[]                                  // All available entities
  selectedEntities: T[]                          // Currently selected
  onSelectionChange: (entities: T[]) => void     // Selection callback
  entityConfig: EntityConfig                     // Display configuration
  label?: string                                 // Field label
  placeholder?: string                           // Placeholder text
}
```

**UI Components**:

- `CustomAutocomplete` for multi-select
- `Chip` for selected items display
- `CustomTextField` for input/search

---

### **List #2: GroupedUserSelector**

An advanced hierarchical user selector with recurring series grouping.

**Purpose**: Display users grouped by their recurring series with group-level and individual-level selection.

**Key Features**:

- Users grouped by `RecurringSeriesDTO`
- Expandable/collapsible series groups (Material-UI `Accordion`)
- Three-state checkboxes:
  - ☐ Unchecked (no users selected)
  - ☑ Checked (all users selected)
  - ⊟ Indeterminate (some users selected)
- Individual user selection within groups
- User display: Avatar + Full Name
- Search across all groups
- Visual series distinction (color coding)

**Props**:

```typescript
interface GroupedUserSelectorProps {
  users: UserDTO[]                               // All available users
  recurringSeries: RecurringSeriesDTO[]          // Series for grouping
  selectedUsers: SelectedUser[]                  // Currently selected
  onSelectionChange: (users: SelectedUser[]) => void
  enableSearch?: boolean                         // Enable search bar
  showAvatars?: boolean                          // Show user avatars
  maxHeight?: string | number                    // Max height for scrolling
}
```

**UI Components**:

- `Accordion` for series groups
- `AccordionSummary` with group checkbox + series info
- `AccordionDetails` with user list
- `Checkbox` (with indeterminate state) for selections
- `Avatar` + `ListItem` for user display
- `TextField` for search
- `Badge` for selection counts

---

### **AssignmentConfigForm** (Optional)

A dynamic form generator for assignment-specific configuration.

**Purpose**: Render configuration fields based on entity type (datetime, visibility, attempts, etc.).

**Key Features**:

- Dynamic field rendering based on `AssignmentConfig`
- Support for multiple field types: `datetime`, `boolean`, `text`, `number`, `select`, `custom`
- Real-time validation
- Default value support

**Props**:

```typescript
interface AssignmentConfigFormProps {
  config?: AssignmentConfig                      // Optional configuration
  values: Record<string, any>                    // Current values
  onChange: (values: Record<string, any>) => void
  errors?: Record<string, string>                // Validation errors
}
```

**UI Components**:

- `DatePicker` for datetime fields
- `Checkbox` / `FormControlLabel` for boolean
- `TextField` for text/number
- `Select` / `Autocomplete` for select fields
- Custom components as specified

---

## 🎨 UI/UX Design Principles

### 1. Visual Hierarchy
- **Level 1**: Modal title and close button
- **Level 2**: Entity selection (primary action)
- **Level 3**: User/Group selection (secondary action)
- **Level 4**: Configuration options (tertiary)
- **Level 5**: Action buttons

### 2. Color Coding
- **Series Groups**: Use theme colors with 20% opacity
  - Primary series: `primary.light`
  - Secondary series: `secondary.light`
  - Rotating colors for multiple series
- **Selected Items**: `primary.main`
- **Validation Errors**: `error.main`

### 3. Spacing & Layout
- Modal padding: `32px` (desktop), `16px` (mobile)
- Section spacing: `24px` between major sections
- Component spacing: `16px` between form fields
- Grid system: 12-column responsive grid

### 4. Animations
- Modal entrance: Slide up + fade (300ms)
- Accordion expand: Smooth height transition (250ms)
- Selection feedback: Scale + ripple effect (200ms)
- Chip add/remove: Fade + slide (150ms)

### 5. Responsive Behavior
- **Desktop (>960px)**: 3-column layout where applicable
- **Tablet (600-960px)**: 2-column layout
- **Mobile (<600px)**: Single column, full width
- Modal size: `md` default, `lg` for complex assignments

---

## 🔧 Implementation Plan

### Phase 1: Core Structure (Priority: High)
1. Create base `GenericAssignmentModal` component
2. Define TypeScript interfaces and types
3. Implement basic modal shell with props
4. Set up state management (local state + context if needed)

### Phase 2: Entity Selection (Priority: High)
1. Build `EntitySelector` component
2. Implement search and filtering
3. Add chip-based selection display
4. Test with different entity types

### Phase 3: Grouped User Selection (Priority: High)
1. Build `GroupedUserSelector` component
2. Implement series grouping logic
3. Add selection state management
4. Implement "select all" at group level
5. Add search within groups
6. Style with Material-UI components

### Phase 4: Configuration Form (Priority: Medium)
1. Build `AssignmentConfigForm` component
2. Implement dynamic field rendering
3. Add validation logic
4. Support custom field components
5. Add default values handling

### Phase 5: Integration & Callbacks (Priority: High)
1. Wire up `onAssign` callback
2. Implement validation flow
3. Add loading states
4. Add error handling and toast notifications
5. Add success feedback

### Phase 6: Polish & Enhancement (Priority: Medium)
1. Add animations and transitions
2. Implement responsive design
3. Add accessibility (ARIA labels, keyboard navigation)
4. Add empty states and loading skeletons
5. Implement search highlighting
6. Add tooltips for complex UI elements

### Phase 7: Documentation & Testing (Priority: Medium)
1. Create Storybook stories
2. Write usage examples
3. Create migration guide from old component
4. Write unit tests
5. Write integration tests

---

## 📦 File Structure

```
src/
├── @core/
│   └── components/
│       └── assignment/
│           ├── GenericAssignmentModal.tsx         (Main component)
│           ├── GenericAssignmentModal.types.ts    (Type definitions)
│           ├── components/
│           │   ├── EntitySelector.tsx
│           │   ├── GroupedUserSelector.tsx
│           │   │   ├── SeriesGroup.tsx
│           │   │   └── UserCheckboxList.tsx
│           │   ├── AssignmentConfigForm.tsx
│           │   └── index.ts
│           ├── hooks/
│           │   ├── useAssignmentState.ts
│           │   ├── useGroupedUsers.ts
│           │   └── useValidation.ts
│           ├── utils/
│           │   ├── groupUsersBySeries.ts
│           │   ├── validateAssignment.ts
│           │   └── formatters.ts
│           └── index.ts
```

---

## 🔄 Migration & Usage Guide

### From Old Implementation to New Two-List Structure

#### **Before (Old)**: Component fetches data internally

```typescript
// Old: AssignationModal.tsx - fetches lessons internally
const AssignationModal = (props: AssignationModalProps) => {
  const [quizzes, setQuizzes] = useState([])
  
  useEffect(() => {
    lessonServiceClient.lessons.getPaginated(...)
      .then(response => setQuizzes(response.data.data))
  }, [])
  
  return (
    <Dialog>
      {/* Hardcoded for lessons only */}
    </Dialog>
  )
}
```

#### **After (New)**: Parent provides data, component is generic

```typescript
// New: Parent component prepares data
const StudentLessonsPage = () => {
  // LIST #1: Fetch entities (lessons in this case)
  const [lessons, setLessons] = useState([])
  
  // LIST #2: Get users and series
  const users = useUsers()
  const recurringSeries = useMyRecurringSeries()
  
  useEffect(() => {
    lessonServiceClient.lessons.getPaginated(...)
      .then(response => setLessons(response.data.data))
  }, [])
  
  // Configure how to display lessons
  const entityConfig: EntityConfig = {
    displayProperty: 'title',
    labelSingular: 'Lecție',
    labelPlural: 'Lecții',
    chipColor: 'primary'
  }
  
  // Optional: Configure assignment fields
  const assignmentConfig: AssignmentConfig = {
    fields: [
      {
        key: 'startAfter',
        type: 'datetime',
        label: 'Poate începe după:',
        required: true,
        defaultValue: new Date()
      },
      {
        key: 'isVisible',
        type: 'boolean',
        label: 'Este vizibilă?',
        defaultValue: false
      }
    ]
  }
  
  // Handle assignment
  const handleAssign = async (assignment: AssignmentPayload<Lesson>) => {
    const requests = assignment.entities.flatMap(entity =>
      assignment.users.map(user => ({
        lessonId: entity.id,
        userId: user.userId,
        startAfter: assignment.options.startAfter,
        isVisible: assignment.options.isVisible
      }))
    )
    
    await apiClient.post('/lesson/assign', requests)
    toast.success('Lecțiile au fost asignate cu succes!')
  }
  
  return (
    <GenericAssignmentModal
      // LIST #1: Entities
      entities={lessons}
      entityConfig={entityConfig}
      
      // LIST #2: Grouped Users
      users={users}
      recurringSeries={recurringSeries}
      
      // Optional: Assignment Configuration
      assignmentConfig={assignmentConfig}
      
      // Callbacks
      onAssign={handleAssign}
      
      // UI
      modalTitle="Asignează lecție"
      confirmButtonText="Asignează"
      triggerButton={
        <Button variant="contained" size="large">
          Asignează o lecție
        </Button>
      }
    />
  )
}
```

---

## 🧪 Usage Examples for Different Entity Types

The same component works with different entity types by simply changing the configuration.

### Example 1: Assigning Lessons

```typescript
const entityConfig: EntityConfig = {
  displayProperty: 'title',
  labelSingular: 'Lecție',
  labelPlural: 'Lecții',
  searchPlaceholder: 'Caută lecții...',
  chipColor: 'primary'
}

const assignmentConfig: AssignmentConfig = {
  fields: [
    {
      key: 'startAfter',
      type: 'datetime',
      label: 'Poate începe după:',
      required: true,
      defaultValue: new Date()
    },
    {
      key: 'isVisible',
      type: 'boolean',
      label: 'Este vizibilă?',
      defaultValue: false
    }
  ]
}

<GenericAssignmentModal
  entities={lessons}
  entityConfig={entityConfig}
  users={users}
  recurringSeries={recurringSeries}
  assignmentConfig={assignmentConfig}
  onAssign={handleLessonAssign}
  modalTitle="Asignează Lecții"
/>
```

### Example 2: Assigning Quizzes

```typescript
const entityConfig: EntityConfig = {
  displayProperty: 'title',
  secondaryProperty: (quiz) => `${quiz.questionCount} întrebări`,
  labelSingular: 'Test',
  labelPlural: 'Teste',
  searchPlaceholder: 'Caută teste...',
  chipColor: 'secondary'
}

const assignmentConfig: AssignmentConfig = {
  fields: [
    {
      key: 'startAfter',
      type: 'datetime',
      label: 'Disponibil de la:',
      required: true
    },
    {
      key: 'deadline',
      type: 'datetime',
      label: 'Termen limită:',
      required: true
    },
    {
      key: 'attempts',
      type: 'number',
      label: 'Număr de încercări:',
      defaultValue: 1,
      validation: (value) => value < 1 ? 'Minim 1 încercare' : undefined
    },
    {
      key: 'isVisible',
      type: 'boolean',
      label: 'Este vizibil?',
      defaultValue: true
    }
  ]
}

<GenericAssignmentModal
  entities={quizzes}
  entityConfig={entityConfig}
  users={users}
  recurringSeries={recurringSeries}
  assignmentConfig={assignmentConfig}
  onAssign={handleQuizAssign}
  modalTitle="Asignează Teste"
/>
```

### Example 3: Assigning Invoices (No Configuration Section)

```typescript
interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
}

const entityConfig: EntityConfig = {
  displayProperty: (invoice: Invoice) => `Factură #${invoice.number}`,
  secondaryProperty: (invoice: Invoice) => `${invoice.amount} ${invoice.currency}`,
  labelSingular: 'Factură',
  labelPlural: 'Facturi',
  chipColor: 'success'
}

// No assignmentConfig - just assign directly
<GenericAssignmentModal
  entities={invoices}
  entityConfig={entityConfig}
  users={users}
  recurringSeries={recurringSeries}
  onAssign={handleInvoiceAssign}
  modalTitle="Asignează Facturi"
/>
```

### Example 4: Custom Entity with Complex Display

```typescript
interface Project {
  id: string
  name: string
  deadline: Date
  status: 'active' | 'pending' | 'completed'
  budget: number
}

const entityConfig: EntityConfig = {
  displayProperty: 'name',
  secondaryProperty: (project: Project) => 
    `Status: ${project.status} | Budget: ${project.budget} RON`,
  labelSingular: 'Proiect',
  labelPlural: 'Proiecte',
  chipColor: 'info'
}

const assignmentConfig: AssignmentConfig = {
  fields: [
    {
      key: 'role',
      type: 'select',
      label: 'Rol în proiect:',
      required: true,
      options: [
        { label: 'Lider', value: 'leader' },
        { label: 'Membru', value: 'member' },
        { label: 'Observator', value: 'observer' }
      ]
    },
    {
      key: 'startDate',
      type: 'datetime',
      label: 'Data începerii:',
      required: true
    },
    {
      key: 'notifyUser',
      type: 'boolean',
      label: 'Trimite notificare?',
      defaultValue: true
    }
  ]
}

<GenericAssignmentModal
  entities={projects}
  entityConfig={entityConfig}
  users={users}
  recurringSeries={recurringSeries}
  assignmentConfig={assignmentConfig}
  onAssign={handleProjectAssign}
  modalTitle="Asignează Proiecte"
/>
```

---

## ✅ Acceptance Criteria

### Functionality
- ✅ Can assign any entity type (lessons, quizzes, invoices, etc.)
- ✅ Users grouped by recurring series with visual hierarchy
- ✅ Users can appear multiple times if in multiple series
- ✅ Selection works at both group and individual level
- ✅ Dynamic configuration form based on entity type
- ✅ Proper validation before submission
- ✅ Success/error feedback with toast notifications

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Clear visual hierarchy
- ✅ Intuitive interactions (hover, focus, active states)
- ✅ Empty states for no data scenarios
- ✅ Loading states during API calls

### Code Quality
- ✅ Fully typed with TypeScript
- ✅ Reusable and decoupled
- ✅ Follows MUI design patterns
- ✅ Proper error handling
- ✅ Clean, documented code
- ✅ No hardcoded values
- ✅ Performant (virtualization for large lists)

---

## 🚀 Performance Considerations

1. **Virtualization**: Use `react-window` for lists > 100 items
2. **Memoization**: Memoize expensive calculations (grouping, filtering)
3. **Debouncing**: Debounce search inputs (300ms)
4. **Lazy Loading**: Load user avatars on-demand
5. **Code Splitting**: Lazy load modal if not immediately needed

---

## 🔐 Accessibility

1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Enter/Space to select
   - Escape to close modal
   - Arrow keys in autocomplete

2. **Screen Reader Support**:
   - Proper ARIA labels
   - Announce selection changes
   - Describe group structures
   - Error announcements

3. **Visual Indicators**:
   - Focus visible (outline)
   - Sufficient color contrast (WCAG AA)
   - Non-color dependent indicators
   - Clear loading states

---

## 📝 Notes

- All text should support internationalization (i18n)
- Consider adding a "Preview" mode before final assignment
- May need to add "Save as Draft" functionality
- Consider adding templates for common assignment patterns
- May need to add bulk import/export functionality
- Consider adding assignment history/audit log

---

## 📝 Summary

### What This Component Does

The `GenericAssignmentModal` is a **highly reusable modal** with **two primary lists**:

1. **Entity List (List #1)**: Select multiple items of any type to assign
2. **Grouped User List (List #2)**: Select users organized by recurring series

### Key Features

✅ **Generic Entity Support**: Works with lessons, quizzes, invoices, or any custom type  
✅ **Two-List Architecture**: Clear separation between "what" (entities) and "who" (users)  
✅ **Hierarchical User Selection**: Select entire groups or individual users  
✅ **Optional Configuration**: Dynamic assignment fields based on entity type  
✅ **Type-Safe**: Full TypeScript support with generics  
✅ **Decoupled**: No internal data fetching - all data via props  
✅ **Reusable**: Located in `src/@core/components/` for project-wide use  

### When to Use This Component

Use this component when you need to:

- Assign any type of entity (lessons, quizzes, tasks, invoices, etc.) to users
- Group users by recurring series with visual hierarchy
- Support both group-level and individual-level selection
- Configure assignment-specific options (dates, visibility, attempts, etc.)
- Maintain type safety across different entity types

### Implementation Priority

**Phase 1 (High Priority)**:

- Core modal structure with TypeScript types
- Entity selector (List #1)
- Grouped user selector (List #2)
- Assignment callback integration

**Phase 2 (Medium Priority)**:

- Optional configuration form
- Validation logic
- UI polish (animations, responsive design)

**Phase 3 (Nice to Have)**:

- Search and filtering
- Bulk actions
- Accessibility improvements
- Performance optimizations (virtualization)

---

**Status**: 📋 Design Updated - Ready for Implementation  
**Last Updated**: November 4, 2025  
**Focus**: Two-list structure with dynamic entity support and grouped users

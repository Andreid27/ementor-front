# GenericAssignmentModal Component

A highly reusable, generic modal component for assigning any type of entity to users grouped by recurring series.

## 📋 Overview

This component features **two dynamic lists**:

1. **Entity List (List #1)**: Multi-select list of assignable objects (lessons, quizzes, invoices, etc.)
2. **Grouped User List (List #2)**: Users organized by recurring series with hierarchical selection

## 🚀 Features

- ✅ **Generic Type Support**: Works with any entity type via TypeScript generics
- ✅ **Two-List Architecture**: Clear separation between entities and users
- ✅ **Hierarchical Selection**: Select entire groups or individual users
- ✅ **Optional Configuration**: Dynamic assignment fields based on entity type
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Validation**: Built-in validation with custom rules
- ✅ **Responsive**: Mobile-friendly design

## 📦 Installation

The component is located at:
```
src/@core/components/assignment/
```

## 🎯 Basic Usage

```tsx
import GenericAssignmentModal from 'src/@core/components/assignment'
import type { EntityConfig, AssignmentConfig } from 'src/@core/components/assignment'

// In your component
const MyComponent = () => {
  // Prepare your data
  const lessons = [...] // Your lessons
  const users = [...] // Your users
  const recurringSeries = [...] // Your recurring series
  
  // Configure entity display
  const entityConfig: EntityConfig = {
    displayProperty: 'title',
    labelSingular: 'Lecție',
    labelPlural: 'Lecții',
    chipColor: 'primary'
  }
  
  // Configure assignment options (optional)
  const assignmentConfig: AssignmentConfig = {
    fields: [
      {
        key: 'startAfter',
        type: 'datetime',
        label: 'Poate începe după:',
        required: true
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
  const handleAssign = async (assignment) => {
    // Create assignment requests
    const requests = assignment.entities.flatMap(entity =>
      assignment.users.map(user => ({
        lessonId: entity.id,
        userId: user.userId,
        ...assignment.options
      }))
    )
    
    // Send to API
    await apiClient.post('/lesson/assign', requests)
  }
  
  return (
    <GenericAssignmentModal
      entities={lessons}
      entityConfig={entityConfig}
      users={users}
      recurringSeries={recurringSeries}
      assignmentConfig={assignmentConfig}
      onAssign={handleAssign}
      modalTitle="Asignează Lecții"
      triggerButton={
        <Button variant="contained">
          Asignează o lecție
        </Button>
      }
    />
  )
}
```

## 📐 Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `entities` | `T[]` | Array of entities to assign |
| `entityConfig` | `EntityConfig` | Configuration for entity display |
| `users` | `UserDTO[]` | Array of available users |
| `recurringSeries` | `RecurringSeriesDTO[]` | Series for grouping users |
| `onAssign` | `(assignment: AssignmentPayload<T>) => Promise<void>` | Assignment callback |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `assignmentConfig` | `AssignmentConfig` | `undefined` | Optional configuration fields |
| `defaultAssignmentOptions` | `Record<string, any>` | `{}` | Default values for options |
| `onValidate` | `(data: ValidationData<T>) => ValidationResult` | `undefined` | Custom validation |
| `open` | `boolean` | `undefined` | Controlled modal visibility |
| `onClose` | `() => void` | `undefined` | Close callback |
| `triggerButton` | `ReactNode` | `undefined` | Button to open modal |
| `modalTitle` | `string` | Auto-generated | Modal title |
| `modalSize` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal size |
| `confirmButtonText` | `string` | `'Asignează'` | Confirm button text |
| `cancelButtonText` | `string` | `'Anulează'` | Cancel button text |

## 🎨 EntityConfig Options

```typescript
interface EntityConfig {
  displayProperty: string | ((entity: any) => string)
  secondaryProperty?: string | ((entity: any) => string)
  labelSingular: string
  labelPlural: string
  searchPlaceholder?: string
  chipColor?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
}
```

## ⚙️ AssignmentConfig Field Types

The component supports multiple field types:

### DateTime Field
```typescript
{
  key: 'startDate',
  type: 'datetime',
  label: 'Start Date',
  required: true
}
```

### Boolean Field
```typescript
{
  key: 'isVisible',
  type: 'boolean',
  label: 'Is Visible?',
  defaultValue: false
}
```

### Text Field
```typescript
{
  key: 'description',
  type: 'text',
  label: 'Description',
  validation: (value) => value.length < 10 ? 'Too short' : undefined
}
```

### Number Field
```typescript
{
  key: 'attempts',
  type: 'number',
  label: 'Number of Attempts',
  defaultValue: 1
}
```

### Select Field
```typescript
{
  key: 'priority',
  type: 'select',
  label: 'Priority',
  options: [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ]
}
```

### Custom Field
```typescript
{
  key: 'custom',
  type: 'custom',
  label: 'Custom Field',
  customComponent: MyCustomComponent
}
```

## 📚 Examples

### Example 1: Assigning Lessons
```tsx
<GenericAssignmentModal
  entities={lessons}
  entityConfig={{
    displayProperty: 'title',
    labelSingular: 'Lecție',
    labelPlural: 'Lecții',
    chipColor: 'primary'
  }}
  users={users}
  recurringSeries={recurringSeries}
  assignmentConfig={{
    fields: [
      { key: 'startAfter', type: 'datetime', label: 'Start After', required: true },
      { key: 'isVisible', type: 'boolean', label: 'Visible?', defaultValue: false }
    ]
  }}
  onAssign={handleLessonAssign}
/>
```

### Example 2: Assigning Quizzes
```tsx
<GenericAssignmentModal
  entities={quizzes}
  entityConfig={{
    displayProperty: 'title',
    secondaryProperty: (q) => `${q.questionCount} questions`,
    labelSingular: 'Quiz',
    labelPlural: 'Quizzes',
    chipColor: 'secondary'
  }}
  users={users}
  recurringSeries={recurringSeries}
  assignmentConfig={{
    fields: [
      { key: 'startDate', type: 'datetime', label: 'Available From', required: true },
      { key: 'deadline', type: 'datetime', label: 'Deadline', required: true },
      { key: 'attempts', type: 'number', label: 'Max Attempts', defaultValue: 3 }
    ]
  }}
  onAssign={handleQuizAssign}
/>
```

### Example 3: Simple Assignment (No Config)
```tsx
<GenericAssignmentModal
  entities={invoices}
  entityConfig={{
    displayProperty: (invoice) => `Invoice #${invoice.number}`,
    labelSingular: 'Invoice',
    labelPlural: 'Invoices',
    chipColor: 'success'
  }}
  users={users}
  recurringSeries={recurringSeries}
  onAssign={handleInvoiceAssign}
/>
```

## 🛠️ Utilities

The component includes several utility functions:

### groupUsersBySeries
```typescript
import { groupUsersBySeries } from 'src/@core/components/assignment/utils'

const groups = groupUsersBySeries(users, recurringSeries)
```

### validateAssignment
```typescript
import { validateAssignment } from 'src/@core/components/assignment/utils'

const result = validateAssignment(entities, users, options, 'Lesson', config)
```

### formatters
```typescript
import { formatUserName, formatDate, formatCount } from 'src/@core/components/assignment/utils'

const name = formatUserName('John', 'Doe') // "Doe John"
const date = formatDate(new Date()) // "04/11/2025 10:30"
const count = formatCount(5, 'user', 'users') // "5 users"
```

## 🪝 Hooks

### useAssignmentState
```typescript
import { useAssignmentState } from 'src/@core/components/assignment/hooks'

const {
  selectedEntities,
  selectedUsers,
  assignmentOptions,
  setSelectedEntities,
  setSelectedUsers,
  setAssignmentOptions,
  reset
} = useAssignmentState({ startDate: new Date() })
```

## 🎨 Customization

The component uses Material-UI theming and can be customized through:

1. **Theme**: Inherits from your MUI theme
2. **Props**: Customize colors, sizes, and labels
3. **CSS**: Override with `sx` prop or global styles

## 🐛 Troubleshooting

### TypeScript Errors
Make sure to specify the entity type:
```typescript
<GenericAssignmentModal<LessonType>
  entities={lessons}
  // ...
/>
```

### Validation Not Working
Ensure required fields are properly configured:
```typescript
assignmentConfig={{
  fields: [
    { key: 'field', type: 'text', required: true }
  ]
}}
```

### Users Not Grouped
Check that `recurringSeries` has `eventAttendees` with matching `attendeeId`:
```typescript
{
  id: 'series-1',
  title: 'Series A',
  eventAttendees: [
    { attendeeId: 'user-1' },
    { attendeeId: 'user-2' }
  ]
}
```

## 📄 License

Internal component for the ementor project.

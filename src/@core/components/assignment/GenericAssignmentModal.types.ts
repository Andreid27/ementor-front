// ** Type Imports
import type { UserDTO, RecurringSeriesDTO } from 'src/generated/profile-service/api'

// ========================================
// LIST #1 TYPES: Entity Configuration
// ========================================

/**
 * Any assignable object must have at least an 'id'
 * Supports any additional properties via index signature
 */
export interface AssignableEntity {
  id: string
  [key: string]: any
}

/**
 * Configures how entities are displayed in List #1 (Entity Selector)
 */
export interface EntityConfig {
  /** Primary label - can be a property name or a function */
  displayProperty: string | ((entity: any) => string)

  /** Optional subtitle for entities */
  secondaryProperty?: string | ((entity: any) => string)

  /** Singular form: "Lesson", "Quiz", "Invoice" */
  labelSingular: string

  /** Plural form: "Lessons", "Quizzes", "Invoices" */
  labelPlural: string

  /** Placeholder for search field */
  searchPlaceholder?: string

  /** Chip color for selected items */
  chipColor?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
}

// ========================================
// LIST #2 TYPES: Grouped User Selection
// ========================================

// Re-export RecurringSeriesDTO from generated types
export type { RecurringSeriesDTO } from 'src/generated/profile-service/api'

/**
 * Represents a selected user with context about how they were selected
 */
export interface SelectedUser {
  /** User ID */
  userId: string

  /** Full user information */
  userInfo: UserDTO

  /** Series ID if selected via series group */
  seriesId?: string

  /** Full series information if selected via series */
  seriesInfo?: RecurringSeriesDTO
}

// ========================================
// ASSIGNMENT CONFIGURATION (Optional)
// ========================================

/**
 * Optional configuration for assignment-specific fields
 */
export interface AssignmentConfig {
  fields: AssignmentField[]
}

/**
 * Defines a single configuration field
 */
export interface AssignmentField {
  /** Unique key for this field */
  key: string

  /** Field type */
  type: 'datetime' | 'boolean' | 'text' | 'number' | 'select' | 'custom'

  /** Display label */
  label: string

  /** Whether field is required */
  required?: boolean

  /** Default value */
  defaultValue?: any

  /** Custom component for rendering (for type='custom') */
  customComponent?: React.ComponentType<any>

  /** Options for select type */
  options?: Array<{ label: string; value: any }>

  /** Validation function - returns error message or undefined */
  validation?: (value: any) => string | undefined
}

// ========================================
// ASSIGNMENT PAYLOAD
// ========================================

/**
 * Data sent to onAssign callback
 */
export interface AssignmentPayload<T extends AssignableEntity> {
  /** Selected entities from List #1 */
  entities: T[]

  /** Selected users from List #2 */
  users: SelectedUser[]

  /** Assignment configuration values */
  options: Record<string, any>
}

/**
 * Validation data for assignment
 */
export interface ValidationData<T extends AssignableEntity> {
  entities: T[]
  users: SelectedUser[]
  options: Record<string, any>
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors?: Array<{
    field: string
    message: string
  }>
}

// ========================================
// MAIN COMPONENT PROPS
// ========================================

/**
 * Props for GenericAssignmentModal component
 */
export interface GenericAssignmentModalProps<T extends AssignableEntity> {
  // ========================================
  // LIST #1: Entity Configuration
  // ========================================

  /** The objects to assign (lessons, quizzes, etc.) */
  entities: T[]

  /** How to display these entities */
  entityConfig: EntityConfig

  // ========================================
  // LIST #2: User & Grouping Configuration
  // ========================================

  /** Series for grouping users */
  recurringSeries: RecurringSeriesDTO[]

  // ========================================
  // Assignment Configuration (Optional)
  // ========================================

  /** Optional configuration fields */
  assignmentConfig?: AssignmentConfig

  /** Default values for assignment options */
  defaultAssignmentOptions?: Record<string, any>

  // ========================================
  // Callbacks
  // ========================================

  /** Called when user clicks "Assign" button */
  onAssign: (assignment: AssignmentPayload<T>) => Promise<void>

  /** Optional validation before assignment */
  onValidate?: (data: ValidationData<T>) => ValidationResult

  // ========================================
  // Modal Control & UI
  // ========================================

  /** Controls modal visibility (optional - can use internal state) */
  open?: boolean

  /** Called when modal should close */
  onClose?: () => void

  /** Trigger button for opening modal (if not controlled externally) */
  triggerButton?: React.ReactNode

  /** Modal title */
  modalTitle?: string

  /** Modal size */
  modalSize?: 'sm' | 'md' | 'lg' | 'xl'

  /** Text for confirm button */
  confirmButtonText?: string

  /** Text for cancel button */
  cancelButtonText?: string
}

// ========================================
// SUB-COMPONENT PROPS
// ========================================

/**
 * Props for EntitySelector component (List #1)
 */
export interface EntitySelectorProps<T extends AssignableEntity> {
  entities: T[]
  selectedEntities: T[]
  onSelectionChange: (entities: T[]) => void
  entityConfig: EntityConfig
  label?: string
  placeholder?: string
}

/**
 * Props for GroupedUserSelector component (List #2)
 */
export interface GroupedUserSelectorProps {
  users: UserDTO[]
  recurringSeries: RecurringSeriesDTO[]
  selectedUsers: SelectedUser[]
  onSelectionChange: (users: SelectedUser[]) => void
  enableSearch?: boolean
  showAvatars?: boolean
  maxHeight?: string | number
}

/**
 * Props for AssignmentConfigForm component (Optional)
 */
export interface AssignmentConfigFormProps {
  config?: AssignmentConfig
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  errors?: Record<string, string>
}

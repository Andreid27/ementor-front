// ** React Types
import { ChangeEvent, MouseEvent } from 'react'

// ** MUI Types
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { SelectChangeEvent } from '@mui/material/Select'

// ** API Types
import { StudentProfessorRelationshipDTO } from 'src/generated/profile-service/api'

// ** Main student interface for the list
export interface StudentListItem {
  id: string
  studentUserId: string
  studentName: string
  email: string
  avatar?: string
  role: string
  pricing: string // Replaces "plan"
  billing: string
  status: string
  defaultPricePerSession?: number
  createdAt: string
  avatarColor?: string
  fullName: string // For compatibility with existing components
}

// ** Component props interfaces
export interface UserListProps {
  apiData?: {
    statsHorizontalWithDetails: Array<{
      [key: string]: any
    }>
  }
}

export interface StudentAvatarProps {
  student: StudentListItem
  onClick: (studentId: string) => void
}

export interface StudentRowActionsProps {
  studentId: string
  onView: (studentId: string) => void
  onEdit?: (studentId: string) => void
  onDelete?: (studentId: string) => void
}

// ** Enhanced UserViewDrawer props
export interface EnhancedUserViewProps {
  open: boolean
  onClose: () => void
  userId: string
  tab: string
  additionalData?: {
    defaultPricePerSession?: number
    relationshipStatus?: string
  }
}

// ** Error handling interfaces
export interface ErrorState {
  loading: boolean
  error: string | null
  students: StudentListItem[]
}

export interface ApiErrorResponse {
  response?: {
    status: number
    data?: any
  }
  message?: string
}

// ** Filter and pagination interfaces
export interface FilterState {
  role: string
  pricing: string
  status: string
  searchValue: string
}

export interface PaginationState {
  page: number
  pageSize: number
}

// ** Event handler types
export type FilterChangeHandler = (event: SelectChangeEvent<string>) => void
export type SearchChangeHandler = (value: string) => void
export type PaginationChangeHandler = (model: GridPaginationModel) => void
export type MenuClickHandler = (event: MouseEvent<HTMLElement>) => void

// ** Data transformation types
export type StudentDataTransformer = (relationships: StudentProfessorRelationshipDTO[]) => StudentListItem[]

// ** Photo loading types
export interface PhotoLoadingState {
  [studentId: string]: {
    loading: boolean
    url?: string
    error?: boolean
  }
}

// ** Toast notification types
export interface ToastOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  autoClose?: number
  hideProgressBar?: boolean
  closeOnClick?: boolean
  pauseOnHover?: boolean
}

export interface ToastMethods {
  error: (message: string, options?: ToastOptions) => void
  success: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
}

// ** Column definition with proper typing
export interface StudentGridColumn extends Omit<GridColDef, 'renderCell'> {
  renderCell?: (params: { row: StudentListItem }) => JSX.Element
}

// ** User role and status objects with proper typing
export interface UserRoleConfig {
  icon: string
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
}

export interface UserRoleObj {
  [key: string]: UserRoleConfig
}

export interface UserStatusObj {
  [key: string]: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
}

// ** Redux store types (if needed)
export interface UserStoreState {
  data: StudentListItem[]
  loading: boolean
  error: string | null
}

export interface RootState {
  user: UserStoreState
}

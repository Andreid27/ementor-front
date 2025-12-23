// ** Default pagination settings
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50]

// ** Default filter values
export const DEFAULT_FILTERS = {
  pricing: '',
  status: '',
  searchValue: ''
}

// ** Photo loading settings
export const PHOTO_LOADING_TIMEOUT = 5000 // 5 seconds
export const MAX_PHOTO_RETRY_ATTEMPTS = 2

// ** Toast notification settings
export const DEFAULT_TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true
}

// ** Error messages
export const ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED: 'Authentication required. Please log in again.',
  ACCESS_DENIED: 'Access denied. You do not have permission to view students.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  NOT_FOUND: 'No students found for your account.',
  NETWORK_ERROR: 'Failed to load students. Please check your connection.',
  PHOTO_BATCH_ERROR: 'Some student photos could not be loaded. Please check your connection.'
} as const

// ** Success messages
export const SUCCESS_MESSAGES = {
  STUDENTS_LOADED: 'Students loaded successfully',
  PHOTO_LOADED: 'Student photos loaded successfully'
} as const

// ** Filter options for dropdowns
export const ROLE_OPTIONS = [
  { value: '', label: 'Select Role' },
  { value: 'student', label: 'Student' },
  { value: 'admin', label: 'Admin' },
  { value: 'author', label: 'Author' },
  { value: 'editor', label: 'Editor' },
  { value: 'maintainer', label: 'Maintainer' },
  { value: 'subscriber', label: 'Subscriber' }
]

export const PRICING_OPTIONS = [
  { value: '', label: 'Select Pricing' },
  { value: 'not set', label: 'Not Set' },
  { value: '10', label: '$10-20/session' },
  { value: '20', label: '$20-30/session' },
  { value: '30', label: '$30-50/session' },
  { value: '50', label: '$50+/session' }
]

export const STATUS_OPTIONS = [
  { value: '', label: 'Select Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' }
]

// ** DataGrid column configuration
export const COLUMN_WIDTHS = {
  USER: 280,
  ROLE: 170,
  PRICING: 120,
  BILLING: 190,
  STATUS: 110,
  ACTIONS: 100
} as const

// ** Avatar settings
export const AVATAR_SETTINGS = {
  SIZE: 38,
  MARGIN_RIGHT: 2.5,
  FONT_WEIGHT: 500
} as const

// ** Drawer settings
export const DRAWER_SETTINGS = {
  DEFAULT_TAB: 'account',
  WIDTH: {
    XS: 375,
    SM: 500,
    MD: 800
  }
} as const

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

interface EventStatusChipProps {
  label: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

// Status is an icon plus a word. Filled theme chips put white on the status color (2.0–2.3:1) and light
// chips color the word on its own tint; here the tint and the icon carry the color, the word stays readable.
const EventStatusChip = ({ label, icon, color }: EventStatusChipProps) => (
  <CustomChip
    rounded
    size='small'
    skin='light'
    color={color}
    label={label}
    icon={<Icon icon={icon} fontSize={14} />}
    sx={{ fontWeight: 500, color: 'text.primary', '& .MuiChip-icon': { color: `${color}.main` } }}
  />
)

export default EventStatusChip

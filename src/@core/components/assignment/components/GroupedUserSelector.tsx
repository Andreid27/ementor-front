// ** React Imports
import { useState, useMemo } from 'react'

// ** MUI Imports
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  Chip,
  Badge
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Imports
import type { GroupedUserSelectorProps, SelectedUser } from '../GenericAssignmentModal.types'
import type { UserDTO } from 'src/generated/profile-service/api'
import EmentorAvatar, { UserType } from '../../ementor-avatar'

/**
 * GroupedUserSelector - List #2: Hierarchical user selector with series grouping
 *
 * Groups users by recurring series with expandable/collapsible groups
 * Supports both group-level and individual-level selection
 */
const GroupedUserSelector = ({
  users,
  recurringSeries,
  selectedUsers,
  onSelectionChange,
  enableSearch = false,
  showAvatars = true,
  maxHeight = 400
}: GroupedUserSelectorProps) => {
  // ========================================
  // STATE
  // ========================================

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedSeries, setExpandedSeries] = useState<string[]>([])

  // ========================================
  // COMPUTED VALUES
  // ========================================

  /**
   * Group users by their recurring series
   */
  const groupedUsers = useMemo(() => {
    const groups = recurringSeries
      .map(series => {
        // Find users that belong to this series
        const attendeeIds = series.eventAttendees?.map(a => a.attendeeId) || []

        const seriesUsers = users.filter(user => {
          // Use 'id' property as the store users have 'id', not 'userId'
          const userId = (user as any).id || user.userId
          const match = attendeeIds.includes(userId || '')
          return match
        })

        return {
          series,
          users: seriesUsers
        }
      })
      .filter(group => group.users.length > 0) // Only show groups with users

    return groups
  }, [users, recurringSeries])
  /**
   * Filter groups based on search query
   */
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedUsers

    const query = searchQuery.toLowerCase()

    return groupedUsers
      .map(group => ({
        ...group,
        users: group.users.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
          return fullName.includes(query)
        })
      }))
      .filter(group => group.users.length > 0)
  }, [groupedUsers, searchQuery])

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  /**
   * Check if a user is selected
   */
  const isUserSelected = (userId: string): boolean => {
    return selectedUsers.some(su => su.userId === userId)
  }

  /**
   * Check if an entire series is selected
   */
  const isSeriesFullySelected = (seriesId: string): boolean => {
    const group = groupedUsers.find(g => g.series.id === seriesId)
    if (!group) return false

    return group.users.every(user => {
      const userId = (user as any).id || user.userId
      return isUserSelected(userId || '')
    })
  }

  /**
   * Check if a series is partially selected
   */
  const isSeriesPartiallySelected = (seriesId: string): boolean => {
    const group = groupedUsers.find(g => g.series.id === seriesId)
    if (!group) return false

    const selectedCount = group.users.filter(user => {
      const userId = (user as any).id || user.userId
      return isUserSelected(userId || '')
    }).length
    return selectedCount > 0 && selectedCount < group.users.length
  }

  /**
   * Get selected count for a series
   */
  const getSeriesSelectedCount = (seriesId: string): number => {
    const group = groupedUsers.find(g => g.series.id === seriesId)
    if (!group) return 0

    return group.users.filter(user => {
      const userId = (user as any).id || user.userId
      return isUserSelected(userId || '')
    }).length
  }

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Toggle series expansion
   */
  const handleToggleSeries = (seriesId: string) => {
    setExpandedSeries(prev => (prev.includes(seriesId) ? prev.filter(id => id !== seriesId) : [...prev, seriesId]))
  }

  /**
   * Handle series checkbox (select all users in series)
   */
  const handleSeriesCheckbox = (seriesId: string) => {
    const group = groupedUsers.find(g => g.series.id === seriesId)
    if (!group) return

    const isFullySelected = isSeriesFullySelected(seriesId)

    if (isFullySelected) {
      // Deselect all users from this series
      const newSelection = selectedUsers.filter(
        su =>
          !group.users.some(u => {
            const userId = (u as any).id || u.userId
            return userId === su.userId
          })
      )
      onSelectionChange(newSelection)
    } else {
      // Select all users from this series
      const newUsers: SelectedUser[] = group.users.map(user => {
        const userId = (user as any).id || user.userId
        return {
          userId: userId || '',
          userInfo: user,
          seriesId: group.series.id,
          seriesInfo: group.series
        }
      })

      // Remove any existing selections for these users and add new ones
      const existingUserIds = group.users.map(u => (u as any).id || u.userId)
      const filteredSelection = selectedUsers.filter(su => !existingUserIds.includes(su.userId))

      onSelectionChange([...filteredSelection, ...newUsers])
    }
  }

  /**
   * Handle individual user checkbox
   */
  const handleUserCheckbox = (user: UserDTO, seriesId: string) => {
    const userId = (user as any).id || user.userId || ''
    const isSelected = isUserSelected(userId)

    if (isSelected) {
      // Deselect user
      const newSelection = selectedUsers.filter(su => su.userId !== userId)
      onSelectionChange(newSelection)
    } else {
      // Select user
      const series = recurringSeries.find(s => s.id === seriesId)
      const newUser: SelectedUser = {
        userId,
        userInfo: user,
        seriesId,
        seriesInfo: series
      }
      onSelectionChange([...selectedUsers, newUser])
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant='body2' fontWeight={600}>
            Utilizatori
          </Typography>
          {selectedUsers.length > 0 && (
            <Chip
              size='small'
              label={`${selectedUsers.length} selectat${selectedUsers.length !== 1 ? 'i' : ''}`}
              color='primary'
              variant='outlined'
            />
          )}
        </Box>

        {/* Search */}
        {enableSearch && (
          <TextField
            size='small'
            fullWidth
            placeholder='Caută utilizatori...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Icon icon='mdi:magnify' fontSize={20} />
            }}
          />
        )}
      </Box>

      {/* Grouped User List */}
      <Box
        sx={{
          maxHeight,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        {filteredGroups.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              {searchQuery ? 'Nu s-au găsit utilizatori' : 'Nu există serii cu utilizatori'}
            </Typography>
          </Box>
        ) : (
          filteredGroups.map(group => {
            const isExpanded = expandedSeries.includes(group.series.id)
            const selectedCount = getSeriesSelectedCount(group.series.id)
            const isFullySelected = isSeriesFullySelected(group.series.id)
            const isPartiallySelected = isSeriesPartiallySelected(group.series.id)

            return (
              <Accordion
                key={group.series.id}
                expanded={isExpanded}
                onChange={() => handleToggleSeries(group.series.id)}
                disableGutters
                elevation={0}
                sx={{
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: 0 }
                }}
              >
                <AccordionSummary
                  expandIcon={<Icon icon='mdi:chevron-down' />}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&.Mui-expanded': { minHeight: 48 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isFullySelected}
                          indeterminate={isPartiallySelected}
                          onChange={e => {
                            e.stopPropagation()
                            handleSeriesCheckbox(group.series.id)
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body2' fontWeight={500}>
                            {group.series.title}
                          </Typography>
                          {group.series.pattern && (
                            <Typography variant='caption' color='text.secondary'>
                              {group.series.pattern}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ mr: 'auto' }}
                    />
                    <Badge badgeContent={selectedCount > 0 ? selectedCount : null} color='primary' sx={{ mr: 2 }}>
                      <Chip size='small' label={`${group.users.length} utilizatori`} variant='outlined' />
                    </Badge>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {group.users.map(user => {
                      const userId = (user as any).id || user.userId || ''
                      const isSelected = isUserSelected(userId)

                      return (
                        <ListItem key={userId} disablePadding>
                          <ListItemButton onClick={() => handleUserCheckbox(user, group.series.id)} dense>
                            <Checkbox checked={isSelected} sx={{ mr: 1 }} />
                            {showAvatars && (
                              <ListItemAvatar>
                                <EmentorAvatar
                                  userId={userId}
                                  userType={UserType.STUDENT}
                                  alt={user.firstName}
                                  sx={{ width: 32, height: 32 }}
                                >
                                  {user.firstName?.[0]}
                                  {user.lastName?.[0]}
                                </EmentorAvatar>
                              </ListItemAvatar>
                            )}
                            <ListItemText
                              primary={`${user.lastName} ${user.firstName}`}
                              primaryTypographyProps={{
                                variant: 'body2'
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          })
        )}
      </Box>
    </Box>
  )
}

export default GroupedUserSelector

// ** React Imports
import React from 'react'

// ** MUI Imports
import { Box, Chip } from '@mui/material'

// ** Custom Component Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Type Imports
import type { EntitySelectorProps, AssignableEntity } from '../GenericAssignmentModal.types'

/**
 * EntitySelector - List #1: Generic multi-select for entities
 *
 * Displays a searchable autocomplete with chip-based selection
 * Supports any entity type through generic typing
 */
function EntitySelector<T extends AssignableEntity>({
  entities,
  selectedEntities,
  onSelectionChange,
  entityConfig,
  label,
  placeholder
}: EntitySelectorProps<T>) {
  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  /**
   * Gets the display value for an entity
   */
  const getDisplayValue = (entity: T): string => {
    if (typeof entityConfig.displayProperty === 'function') {
      return entityConfig.displayProperty(entity)
    }
    return entity[entityConfig.displayProperty] || ''
  }

  /**
   * Gets the secondary display value for an entity (if configured)
   */
  const getSecondaryValue = (entity: T): string | undefined => {
    if (!entityConfig.secondaryProperty) return undefined

    if (typeof entityConfig.secondaryProperty === 'function') {
      return entityConfig.secondaryProperty(entity)
    }
    return entity[entityConfig.secondaryProperty]
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <Box>
      <CustomAutocomplete
        {...({
          multiple: true,
          value: selectedEntities,
          options: entities,
          id: 'entity-selector-autocomplete',
          getOptionLabel: (option: T) => getDisplayValue(option),
          isOptionEqualToValue: (option: T, value: T) => option.id === value.id,
          renderInput: (params: any) => (
            <CustomTextField
              {...params}
              label={label || 'Selectează'}
              placeholder={placeholder || 'Caută...'}
            />
          ),
          onChange: (event: any, newValue: T[]) => {
            onSelectionChange(newValue)
          },
          renderTags: (value: T[], getTagProps: any) =>
            value.map((option: T, index: number) => {
              const secondary = getSecondaryValue(option)

              return (
                <Chip
                  label={
                    secondary
                      ? `${getDisplayValue(option)} - ${secondary}`
                      : getDisplayValue(option)
                  }
                  {...getTagProps({ index })}
                  color={entityConfig.chipColor || 'primary'}
                  onDelete={() => {
                    const newValue = [...selectedEntities]
                    newValue.splice(index, 1)
                    onSelectionChange(newValue)
                  }}
                  key={option.id}
                />
              )
            }),
          renderOption: (props: any, option: T) => {
            const secondary = getSecondaryValue(option)

            return (
              <Box component='li' {...props} key={option.id}>
                <Box>
                  <Box>{getDisplayValue(option)}</Box>
                  {secondary && (
                    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                      {secondary}
                    </Box>
                  )}
                </Box>
              </Box>
            )
          }
        } as any)}
      />
    </Box>
  )
}

export default EntitySelector

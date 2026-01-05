import { Select, MenuItem, FormControl } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import type { FC } from 'react'

interface FilterControlProps {
  value: string
  onChange: (value: string) => void
}

const FILTER_OPTIONS = {
  all: 'הכל',        // All
  new: 'חדש',        // New
  assigned: 'משוייך',  // Assigned
  resolved: 'טופל',    // Resolved
}

const FILTER_KEYS = ['all', 'new', 'assigned', 'resolved'] as const

/**
 * Filter control component for incident list
 * Allows filtering by status (All/New/Assigned/Resolved)
 */
export const FilterControl: FC<FilterControlProps> = ({ value, onChange }) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value)
  }

  return (
    <FormControl size="small">
      <Select
        value={value}
        onChange={handleChange}
        aria-label="סינון"
        sx={{
          minHeight: 48,
          minWidth: 100,
        }}
      >
        {FILTER_KEYS.map((status) => (
          <MenuItem key={status} value={status}>
            {FILTER_OPTIONS[status]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

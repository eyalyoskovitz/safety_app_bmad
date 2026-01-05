import { Select, MenuItem, FormControl } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import type { FC } from 'react'

interface SortControlProps {
  value: 'asc' | 'desc'
  onChange: (value: 'asc' | 'desc') => void
}

const SORT_OPTIONS = {
  desc: 'חדש לישן', // Newest first
  asc: 'ישן לחדש',  // Oldest first
}

/**
 * Sort control component for incident list
 * Allows sorting by date (newest/oldest first)
 */
export const SortControl: FC<SortControlProps> = ({ value, onChange }) => {
  const handleChange = (event: SelectChangeEvent<'asc' | 'desc'>) => {
    onChange(event.target.value as 'asc' | 'desc')
  }

  return (
    <FormControl size="small">
      <Select
        value={value}
        onChange={handleChange}
        aria-label="סידור"
        sx={{
          minHeight: 48,
          minWidth: 120,
        }}
      >
        <MenuItem value="desc">{SORT_OPTIONS.desc}</MenuItem>
        <MenuItem value="asc">{SORT_OPTIONS.asc}</MenuItem>
      </Select>
    </FormControl>
  )
}

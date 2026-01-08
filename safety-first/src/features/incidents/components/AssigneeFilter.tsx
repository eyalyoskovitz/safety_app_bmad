import { Select, MenuItem, FormControl } from '@mui/material'

interface AssigneeFilterProps {
  value: string  // 'all' or user ID
  onChange: (value: string) => void
  managers: Array<{ id: string; full_name: string }>
}

/**
 * Assignee filter dropdown component
 * Allows filtering incidents by assigned manager
 * Follows pattern from FilterControl component
 */
export function AssigneeFilter({ value, onChange, managers }: AssigneeFilterProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
      >
        <MenuItem value="all">הכל</MenuItem>
        {managers.map((manager) => (
          <MenuItem key={manager.id} value={manager.id}>
            {manager.full_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

import { Trash2 } from 'lucide-react';
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { OPERATOR_LABELS } from '../../config/filtering';
import type { FilterCondition, FilterField, FilterOperator } from '../../types';
import { FilterValueInput } from './FilterValueInput';

interface FilterConditionRowProps<TRecord> {
  condition: FilterCondition;
  fields: FilterField<TRecord>[];
  field: FilterField<TRecord>;
  error?: string;
  onFieldChange: (fieldKey: string) => void;
  onOperatorChange: (operator: FilterOperator) => void;
  onValueChange: (value: FilterCondition['value']) => void;
  onRemove: () => void;
}

export const FilterConditionRow = <TRecord,>({
  condition,
  fields,
  field,
  error,
  onFieldChange,
  onOperatorChange,
  onValueChange,
  onRemove,
}: FilterConditionRowProps<TRecord>) => (
  <Paper sx={{ p: 2 }} variant="outlined">
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600 }} variant="body2">
            Filter Condition
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {field.description ?? 'Set a field, operator, and value to narrow the table results.'}
          </Typography>
        </Box>
        <Tooltip title="Remove filter">
          <IconButton aria-label="Remove filter condition" color="error" onClick={onRemove}>
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
        <FormControl fullWidth size="small">
          <InputLabel id={`${condition.id}-field-label`}>Field</InputLabel>
          <Select
            label="Field"
            labelId={`${condition.id}-field-label`}
            value={condition.fieldKey}
            onChange={(event) => onFieldChange(event.target.value)}
          >
            {fields.map((availableField) => (
              <MenuItem key={availableField.key} value={availableField.key}>
                {availableField.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id={`${condition.id}-operator-label`}>Operator</InputLabel>
          <Select
            label="Operator"
            labelId={`${condition.id}-operator-label`}
            value={condition.operator}
            onChange={(event) => onOperatorChange(event.target.value)}
          >
            {field.operators.map((operator) => (
              <MenuItem key={operator} value={operator}>
                {OPERATOR_LABELS[operator]}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Operators update dynamically for the selected field type.</FormHelperText>
        </FormControl>

        <Box sx={{ flex: 1.4 }}>
          <FilterValueInput
            error={error}
            field={field}
            operator={condition.operator}
            value={condition.value}
            onChange={onValueChange}
          />
        </Box>
      </Stack>
    </Stack>
  </Paper>
);

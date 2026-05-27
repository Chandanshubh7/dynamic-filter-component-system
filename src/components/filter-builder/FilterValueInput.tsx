import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { format, parseISO } from 'date-fns';

import type {
  DateRangeValue,
  FilterField,
  FilterOperator,
  FilterValue,
  NumericRangeValue,
} from '../../types';

interface FilterValueInputProps<TRecord> {
  field: FilterField<TRecord>;
  operator: FilterOperator;
  value: FilterValue;
  error?: string;
  onChange: (value: FilterValue) => void;
}

const formatDateValue = (date: Date | null): string | null => (date ? format(date, 'yyyy-MM-dd') : null);

const toDate = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  try {
    return parseISO(value);
  } catch {
    return null;
  }
};

const asNumericRange = (value: FilterValue): NumericRangeValue => {
  if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
    return value as NumericRangeValue;
  }

  return { min: '', max: '' };
};

const asDateRange = (value: FilterValue): DateRangeValue => {
  if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
    return value as DateRangeValue;
  }

  return { start: null, end: null };
};

export const FilterValueInput = <TRecord,>({
  field,
  operator,
  value,
  error,
  onChange,
}: FilterValueInputProps<TRecord>) => {
  if (field.type === 'text') {
    return (
      <TextField
        fullWidth
        size="small"
        label="Value"
        value={typeof value === 'string' ? value : ''}
        error={Boolean(error)}
        helperText={error || ' '}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === 'number' && operator !== 'between') {
    return (
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Value"
        value={typeof value === 'string' ? value : ''}
        error={Boolean(error)}
        helperText={error || ' '}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === 'currency' || (field.type === 'number' && operator === 'between')) {
    const range = asNumericRange(value);

    return (
      <Stack spacing={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={field.type === 'currency' ? 'Min Amount' : 'Minimum'}
            value={range.min}
            onChange={(event) => onChange({ ...range, min: event.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label={field.type === 'currency' ? 'Max Amount' : 'Maximum'}
            value={range.max}
            onChange={(event) => onChange({ ...range, max: event.target.value })}
          />
        </Stack>
        <FormHelperText error={Boolean(error)}>{error || ' '}</FormHelperText>
      </Stack>
    );
  }

  if (field.type === 'date') {
    if (operator === 'last30Days') {
      return (
        <Typography color="text.secondary" variant="body2">
          Filters records that fall within the last 30 days.
        </Typography>
      );
    }

    if (operator === 'between') {
      const range = asDateRange(value);

      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <DatePicker
                label="Start Date"
                value={toDate(range.start)}
                onChange={(date) => onChange({ ...range, start: formatDateValue(date) })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={toDate(range.end)}
                onChange={(date) => onChange({ ...range, end: formatDateValue(date) })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Stack>
            <FormHelperText error={Boolean(error)}>{error || ' '}</FormHelperText>
          </Stack>
        </LocalizationProvider>
      );
    }

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date"
          value={typeof value === 'string' ? toDate(value) : null}
          onChange={(date) => onChange(formatDateValue(date))}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              error: Boolean(error),
              helperText: error || ' ',
            },
          }}
        />
      </LocalizationProvider>
    );
  }

  if (field.type === 'singleSelect') {
    return (
      <FormControl error={Boolean(error)} fullWidth size="small">
        <InputLabel id={`${field.key}-value-label`}>Value</InputLabel>
        <Select
          label="Value"
          labelId={`${field.key}-value-label`}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{error || ' '}</FormHelperText>
      </FormControl>
    );
  }

  if (field.type === 'multiSelect') {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <FormControl error={Boolean(error)} fullWidth size="small">
        <InputLabel id={`${field.key}-value-label`}>Values</InputLabel>
        <Select
          multiple
          label="Values"
          labelId={`${field.key}-value-label`}
          value={selectedValues}
          renderValue={(selected) => (selected as string[]).join(', ')}
          onChange={(event) => onChange(event.target.value as string[])}
        >
          {field.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox checked={selectedValues.includes(option.value)} />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{error || ' '}</FormHelperText>
      </FormControl>
    );
  }

  return (
    <Stack spacing={0.5}>
      <ToggleButtonGroup
        color="primary"
        exclusive
        size="small"
        value={typeof value === 'boolean' ? String(value) : null}
        onChange={(_event, nextValue: string | null) => {
          if (nextValue === null) {
            onChange(null);
            return;
          }

          onChange(nextValue === 'true');
        }}
      >
        <ToggleButton value="true">True</ToggleButton>
        <ToggleButton value="false">False</ToggleButton>
      </ToggleButtonGroup>
      <FormHelperText error={Boolean(error)}>{error || ' '}</FormHelperText>
    </Stack>
  );
};

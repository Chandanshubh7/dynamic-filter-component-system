import { Plus, RotateCcw } from 'lucide-react';
import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

import { getDefaultValue } from '../../config/filtering';
import type { FilterCondition, FilterField, FilterOperator } from '../../types';
import {
  createCondition,
  getFieldMap,
  validateCondition,
} from '../../utils/filtering';
import { FilterConditionRow } from './FilterConditionRow';

interface FilterBuilderProps<TRecord> {
  conditions: FilterCondition[];
  fields: FilterField<TRecord>[];
  onChange: (conditions: FilterCondition[]) => void;
}

export const FilterBuilder = <TRecord,>({
  conditions,
  fields,
  onChange,
}: FilterBuilderProps<TRecord>) => {
  const fieldMap = useMemo(() => getFieldMap(fields), [fields]);

  const conditionMetadata = conditions.map((condition) => {
    const field = fieldMap.get(condition.fieldKey) ?? fields[0];
    const validation = validateCondition(condition, field);

    return {
      condition,
      field,
      validation,
    };
  });

  const validConditionCount = conditionMetadata.filter(({ validation }) => validation.isValid).length;
  const invalidConditionCount = conditions.length - validConditionCount;

  const updateCondition = (
    conditionId: string,
    updater: (condition: FilterCondition) => FilterCondition,
  ) => {
    onChange(conditions.map((condition) => (condition.id === conditionId ? updater(condition) : condition)));
  };

  const addCondition = () => {
    onChange([...conditions, createCondition(fields[0])]);
  };

  const removeCondition = (conditionId: string) => {
    onChange(conditions.filter((condition) => condition.id !== conditionId));
  };

  const clearConditions = () => {
    onChange([]);
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }} variant="outlined">
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack spacing={0.75}>
            <Typography variant="h6">Dynamic Filter Builder</Typography>
            <Typography color="text.secondary" variant="body2">
              Different fields combine with <strong>AND</strong>; multiple conditions on the same
              field combine with <strong>OR</strong>.
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip color="primary" label={`${validConditionCount} active`} variant="filled" />
            <Chip
              color={invalidConditionCount > 0 ? 'warning' : 'default'}
              label={`${invalidConditionCount} incomplete`}
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button startIcon={<Plus size={16} />} variant="contained" onClick={addCondition}>
            Add filter
          </Button>
          <Button
            color="inherit"
            disabled={conditions.length === 0}
            startIcon={<RotateCcw size={16} />}
            variant="outlined"
            onClick={clearConditions}
          >
            Clear all
          </Button>
        </Stack>

        {conditions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }} variant="outlined">
            <Typography gutterBottom sx={{ fontWeight: 600 }} variant="body1">
              No filters configured yet
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Add a condition to start filtering employees by text, number, date, status,
              arrays, or nested object values.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {conditionMetadata.map(({ condition, field, validation }) => (
              <FilterConditionRow
                key={condition.id}
                condition={condition}
                error={validation.isValid ? undefined : validation.message}
                field={field}
                fields={fields}
                onFieldChange={(fieldKey) => {
                  const nextField = fieldMap.get(fieldKey) ?? fields[0];
                  const nextOperator = nextField.operators[0];

                  updateCondition(condition.id, () => ({
                    id: condition.id,
                    fieldKey: nextField.key,
                    operator: nextOperator,
                    value: getDefaultValue(nextField, nextOperator),
                  }));
                }}
                onOperatorChange={(operator) => {
                  const nextOperator = operator as FilterOperator;
                  updateCondition(condition.id, () => ({
                    ...condition,
                    operator: nextOperator,
                    value: getDefaultValue(field, nextOperator),
                  }));
                }}
                onRemove={() => removeCondition(condition.id)}
                onValueChange={(value) => {
                  updateCondition(condition.id, (current) => ({
                    ...current,
                    value,
                  }));
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

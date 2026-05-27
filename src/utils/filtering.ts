import { isAfter, isBefore, isValid, parseISO, startOfDay, subDays } from 'date-fns';

import { getDefaultOperator, getDefaultValue } from '../config/filtering';
import type {
  DateRangeValue,
  FilterCondition,
  FilterField,
  FilterOperator,
  FilterValue,
  NumericRangeValue,
  ValidationResult,
} from '../types';
import { getValueByPath } from './object';

const normalize = (value: unknown): string => String(value ?? '').trim().toLowerCase();

const isNumericRangeValue = (value: FilterValue): value is NumericRangeValue =>
  typeof value === 'object' &&
  value !== null &&
  'min' in value &&
  'max' in value &&
  typeof value.min === 'string' &&
  typeof value.max === 'string';

const isDateRangeValue = (value: FilterValue): value is DateRangeValue =>
  typeof value === 'object' &&
  value !== null &&
  'start' in value &&
  'end' in value;

const parseNumber = (value: string): number | null => {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDate = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? startOfDay(parsed) : null;
};

const getFieldValue = <TRecord>(record: TRecord, field: FilterField<TRecord>): unknown => {
  if (field.accessor) {
    return field.accessor(record);
  }

  return getValueByPath(record, field.path);
};

export const createCondition = <TRecord>(field: FilterField<TRecord>): FilterCondition => {
  const operator = getDefaultOperator(field);

  return {
    id: crypto.randomUUID(),
    fieldKey: field.key,
    operator,
    value: getDefaultValue(field, operator),
  };
};

export const getFieldMap = <TRecord>(fields: FilterField<TRecord>[]) =>
  new Map(fields.map((field) => [field.key, field] as const));

export const getNextConditionForField = <TRecord>(
  fields: FilterField<TRecord>[],
  fieldKey?: string,
): FilterCondition => {
  const defaultField = fields.find((field) => field.key === fieldKey) ?? fields[0];
  return createCondition(defaultField);
};

const validateNumericRange = (value: FilterValue, label: string): ValidationResult => {
  if (!isNumericRangeValue(value)) {
    return { isValid: false, message: `${label} requires a minimum and maximum value.` };
  }

  const min = parseNumber(value.min);
  const max = parseNumber(value.max);

  if (min === null || max === null) {
    return { isValid: false, message: `${label} requires valid minimum and maximum values.` };
  }

  if (min > max) {
    return { isValid: false, message: `${label} minimum cannot be greater than the maximum.` };
  }

  return { isValid: true };
};

const validateDateRange = (value: FilterValue): ValidationResult => {
  if (!isDateRangeValue(value)) {
    return { isValid: false, message: 'Please select both start and end dates.' };
  }

  const start = parseDate(value.start);
  const end = parseDate(value.end);

  if (!start || !end) {
    return { isValid: false, message: 'Please select both start and end dates.' };
  }

  if (isAfter(start, end)) {
    return { isValid: false, message: 'Start date cannot be after the end date.' };
  }

  return { isValid: true };
};

const validateSingleDate = (value: FilterValue): ValidationResult => {
  if (typeof value !== 'string' || !parseDate(value)) {
    return { isValid: false, message: 'Please select a valid date.' };
  }

  return { isValid: true };
};

export const validateCondition = <TRecord>(
  condition: FilterCondition,
  field: FilterField<TRecord>,
): ValidationResult => {
  switch (field.type) {
    case 'text':
      return typeof condition.value === 'string' && condition.value.trim() !== ''
        ? { isValid: true }
        : { isValid: false, message: 'Enter a value to apply this text filter.' };

    case 'number':
      if (condition.operator === 'between') {
        return validateNumericRange(condition.value, field.label);
      }

      return typeof condition.value === 'string' && parseNumber(condition.value) !== null
        ? { isValid: true }
        : { isValid: false, message: `Enter a valid number for ${field.label}.` };

    case 'currency':
      return validateNumericRange(condition.value, field.label);

    case 'date':
      if (condition.operator === 'last30Days') {
        return { isValid: true };
      }

      if (condition.operator === 'between') {
        return validateDateRange(condition.value);
      }

      return validateSingleDate(condition.value);

    case 'singleSelect':
      return typeof condition.value === 'string' && condition.value !== ''
        ? { isValid: true }
        : { isValid: false, message: `Choose an option for ${field.label}.` };

    case 'multiSelect':
      return Array.isArray(condition.value) && condition.value.length > 0
        ? { isValid: true }
        : { isValid: false, message: `Select at least one ${field.label.toLowerCase()} option.` };

    case 'boolean':
      return typeof condition.value === 'boolean'
        ? { isValid: true }
        : { isValid: false, message: `Choose a value for ${field.label}.` };

    default:
      return { isValid: false, message: 'Unsupported filter type.' };
  }
};

const compareText = (recordValue: unknown, operator: FilterOperator, filterValue: string): boolean => {
  const target = normalize(recordValue);
  const candidate = normalize(filterValue);

  switch (operator) {
    case 'equals':
      return target === candidate;
    case 'contains':
      return target.includes(candidate);
    case 'startsWith':
      return target.startsWith(candidate);
    case 'endsWith':
      return target.endsWith(candidate);
    case 'doesNotContain':
      return !target.includes(candidate);
    default:
      return false;
  }
};

const compareNumber = (
  recordValue: unknown,
  operator: FilterOperator,
  filterValue: FilterValue,
): boolean => {
  const target = Number(recordValue);

  if (!Number.isFinite(target)) {
    return false;
  }

  if (operator === 'between') {
    if (!isNumericRangeValue(filterValue)) {
      return false;
    }

    const min = parseNumber(filterValue.min);
    const max = parseNumber(filterValue.max);

    return min !== null && max !== null ? target >= min && target <= max : false;
  }

  if (typeof filterValue !== 'string') {
    return false;
  }

  const candidate = parseNumber(filterValue);

  if (candidate === null) {
    return false;
  }

  switch (operator) {
    case 'equals':
      return target === candidate;
    case 'notEquals':
      return target !== candidate;
    case 'greaterThan':
      return target > candidate;
    case 'lessThan':
      return target < candidate;
    case 'greaterThanOrEqual':
      return target >= candidate;
    case 'lessThanOrEqual':
      return target <= candidate;
    default:
      return false;
  }
};

const compareDate = (
  recordValue: unknown,
  operator: FilterOperator,
  filterValue: FilterValue,
): boolean => {
  const target = parseDate(typeof recordValue === 'string' ? recordValue : null);

  if (!target) {
    return false;
  }

  if (operator === 'last30Days') {
    return !isBefore(target, subDays(startOfDay(new Date()), 30));
  }

  if (operator === 'between') {
    if (!isDateRangeValue(filterValue)) {
      return false;
    }

    const start = parseDate(filterValue.start);
    const end = parseDate(filterValue.end);

    return Boolean(start && end && !isBefore(target, start) && !isAfter(target, end));
  }

  if (typeof filterValue !== 'string') {
    return false;
  }

  const candidate = parseDate(filterValue);

  if (!candidate) {
    return false;
  }

  switch (operator) {
    case 'before':
      return isBefore(target, candidate);
    case 'after':
      return isAfter(target, candidate);
    default:
      return false;
  }
};

const compareSingleSelect = (
  recordValue: unknown,
  operator: FilterOperator,
  filterValue: string,
): boolean => {
  const target = normalize(recordValue);
  const candidate = normalize(filterValue);

  switch (operator) {
    case 'is':
      return target === candidate;
    case 'isNot':
      return target !== candidate;
    default:
      return false;
  }
};

const compareMultiSelect = (
  recordValue: unknown,
  operator: FilterOperator,
  filterValue: string[],
): boolean => {
  if (!Array.isArray(recordValue)) {
    return false;
  }

  const target = recordValue.map((item) => normalize(item));
  const selected = filterValue.map((item) => normalize(item));

  switch (operator) {
    case 'in':
      return selected.some((item) => target.includes(item));
    case 'notIn':
      return selected.every((item) => !target.includes(item));
    case 'containsAll':
      return selected.every((item) => target.includes(item));
    default:
      return false;
  }
};

const compareBoolean = (recordValue: unknown, filterValue: boolean): boolean =>
  typeof recordValue === 'boolean' && recordValue === filterValue;

export const matchesCondition = <TRecord>(
  record: TRecord,
  condition: FilterCondition,
  field: FilterField<TRecord>,
): boolean => {
  const value = getFieldValue(record, field);

  switch (field.type) {
    case 'text':
      return typeof condition.value === 'string'
        ? compareText(value, condition.operator, condition.value)
        : false;

    case 'number':
    case 'currency':
      return compareNumber(value, condition.operator, condition.value);

    case 'date':
      return compareDate(value, condition.operator, condition.value);

    case 'singleSelect':
      return typeof condition.value === 'string'
        ? compareSingleSelect(value, condition.operator, condition.value)
        : false;

    case 'multiSelect':
      return Array.isArray(condition.value)
        ? compareMultiSelect(value, condition.operator, condition.value)
        : false;

    case 'boolean':
      return typeof condition.value === 'boolean' ? compareBoolean(value, condition.value) : false;

    default:
      return false;
  }
};

export const filterRecords = <TRecord>(
  records: TRecord[],
  conditions: FilterCondition[],
  fields: FilterField<TRecord>[],
): TRecord[] => {
  if (conditions.length === 0) {
    return records;
  }

  const fieldMap = getFieldMap(fields);
  const validConditions = conditions.filter((condition) => {
    const field = fieldMap.get(condition.fieldKey);
    return field ? validateCondition(condition, field).isValid : false;
  });

  if (validConditions.length === 0) {
    return records;
  }

  const groupedConditions = validConditions.reduce<Record<string, FilterCondition[]>>(
    (accumulator, condition) => {
      accumulator[condition.fieldKey] ??= [];
      accumulator[condition.fieldKey].push(condition);
      return accumulator;
    },
    {},
  );

  return records.filter((record) =>
    Object.entries(groupedConditions).every(([fieldKey, grouped]) => {
      const field = fieldMap.get(fieldKey);

      if (!field) {
        return true;
      }

      return grouped.some((condition) => matchesCondition(record, condition, field));
    }),
  );
};

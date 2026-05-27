import type {
  DateRangeValue,
  FilterField,
  FilterOperator,
  FilterValue,
  NumericRangeValue,
} from '../types';

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  notEquals: 'Does Not Equal',
  contains: 'Contains',
  startsWith: 'Starts With',
  endsWith: 'Ends With',
  doesNotContain: 'Does Not Contain',
  greaterThan: 'Greater Than',
  lessThan: 'Less Than',
  greaterThanOrEqual: 'Greater Than or Equal',
  lessThanOrEqual: 'Less Than or Equal',
  between: 'Between',
  before: 'Before',
  after: 'After',
  last30Days: 'Last 30 Days',
  is: 'Is',
  isNot: 'Is Not',
  in: 'In',
  notIn: 'Not In',
  containsAll: 'Contains All',
};

export const DEFAULT_NUMERIC_RANGE: NumericRangeValue = {
  min: '',
  max: '',
};

export const DEFAULT_DATE_RANGE: DateRangeValue = {
  start: null,
  end: null,
};

export const getDefaultOperator = <TRecord>(field: FilterField<TRecord>): FilterOperator =>
  field.operators[0];

export const getDefaultValue = <TRecord>(
  field: FilterField<TRecord>,
  operator: FilterOperator,
): FilterValue => {
  if (field.type === 'date') {
    return operator === 'last30Days' ? null : { ...DEFAULT_DATE_RANGE };
  }

  if (field.type === 'currency' || (field.type === 'number' && operator === 'between')) {
    return { ...DEFAULT_NUMERIC_RANGE };
  }

  if (field.type === 'multiSelect') {
    return [];
  }

  if (field.type === 'boolean') {
    return null;
  }

  return '';
};

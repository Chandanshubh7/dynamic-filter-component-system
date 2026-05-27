import type { ReactNode } from 'react';

export type FilterFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'currency'
  | 'singleSelect'
  | 'multiSelect'
  | 'boolean';

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'doesNotContain'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between'
  | 'before'
  | 'after'
  | 'last30Days'
  | 'is'
  | 'isNot'
  | 'in'
  | 'notIn'
  | 'containsAll';

export interface SelectOption {
  label: string;
  value: string;
}

export interface NumericRangeValue {
  min: string;
  max: string;
}

export interface DateRangeValue {
  start: string | null;
  end: string | null;
}

export type FilterValue =
  | string
  | string[]
  | boolean
  | null
  | NumericRangeValue
  | DateRangeValue;

export interface FilterField<TRecord> {
  key: string;
  path: string;
  label: string;
  type: FilterFieldType;
  operators: FilterOperator[];
  options?: SelectOption[];
  description?: string;
  accessor?: (record: TRecord) => unknown;
}

export interface FilterCondition {
  id: string;
  fieldKey: string;
  operator: FilterOperator;
  value: FilterValue;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface TableColumn<TRecord> {
  key: string;
  label: string;
  path?: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  render?: (record: TRecord) => ReactNode;
  sortAccessor?: (record: TRecord) => string | number | boolean | Date | null;
}

export interface Address {
  city: string;
  state: string;
  country: string;
}

export interface EmployeeRecord {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
  skills: string[];
  address: Address;
  projects: number;
  lastReview: string;
  performanceRating: number;
}

export interface EmployeeApiResponse {
  data: EmployeeRecord[];
  meta: {
    total: number;
    generatedAt: string;
  };
}

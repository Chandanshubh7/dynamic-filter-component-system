import { Chip, Stack, Typography } from '@mui/material';

import type { EmployeeRecord, FilterField, TableColumn } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';

const toOptions = (values: string[]) => values.map((value) => ({ label: value, value }));

export const departmentOptions = toOptions([
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'Human Resources',
]);

export const roleOptions = toOptions([
  'Senior Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Engineering Manager',
  'Product Manager',
  'Product Designer',
  'UX Researcher',
  'Growth Specialist',
  'Sales Manager',
  'Operations Analyst',
  'Finance Partner',
  'HR Business Partner',
]);

export const cityOptions = toOptions([
  'San Francisco',
  'New York',
  'Seattle',
  'Austin',
  'Chicago',
  'Denver',
  'Boston',
  'Atlanta',
]);

export const skillOptions = toOptions([
  'React',
  'TypeScript',
  'Node.js',
  'GraphQL',
  'Figma',
  'SQL',
  'Python',
  'AWS',
  'Docker',
  'Next.js',
  'Product Strategy',
  'Data Analysis',
]);

export const employeeFilterFields: FilterField<EmployeeRecord>[] = [
  {
    key: 'name',
    path: 'name',
    label: 'Name',
    type: 'text',
    operators: ['equals', 'contains', 'startsWith', 'endsWith', 'doesNotContain'],
    description: 'Search employee names.',
  },
  {
    key: 'email',
    path: 'email',
    label: 'Email',
    type: 'text',
    operators: ['equals', 'contains', 'startsWith', 'endsWith', 'doesNotContain'],
    description: 'Filter by work email.',
  },
  {
    key: 'department',
    path: 'department',
    label: 'Department',
    type: 'singleSelect',
    operators: ['is', 'isNot'],
    options: departmentOptions,
    description: 'Business function for the employee.',
  },
  {
    key: 'role',
    path: 'role',
    label: 'Role',
    type: 'singleSelect',
    operators: ['is', 'isNot'],
    options: roleOptions,
    description: 'Current job title.',
  },
  {
    key: 'salary',
    path: 'salary',
    label: 'Salary',
    type: 'currency',
    operators: ['between'],
    description: 'Annual salary in USD.',
  },
  {
    key: 'projects',
    path: 'projects',
    label: 'Projects',
    type: 'number',
    operators: [
      'equals',
      'notEquals',
      'greaterThan',
      'lessThan',
      'greaterThanOrEqual',
      'lessThanOrEqual',
      'between',
    ],
    description: 'Number of active projects.',
  },
  {
    key: 'performanceRating',
    path: 'performanceRating',
    label: 'Performance Rating',
    type: 'number',
    operators: [
      'equals',
      'notEquals',
      'greaterThan',
      'lessThan',
      'greaterThanOrEqual',
      'lessThanOrEqual',
      'between',
    ],
    description: 'Latest review score.',
  },
  {
    key: 'joinDate',
    path: 'joinDate',
    label: 'Join Date',
    type: 'date',
    operators: ['between', 'before', 'after', 'last30Days'],
    description: 'When the employee joined the company.',
  },
  {
    key: 'lastReview',
    path: 'lastReview',
    label: 'Last Review',
    type: 'date',
    operators: ['between', 'before', 'after', 'last30Days'],
    description: 'Date of the last performance review.',
  },
  {
    key: 'isActive',
    path: 'isActive',
    label: 'Active Status',
    type: 'boolean',
    operators: ['is'],
    description: 'Whether the employee is currently active.',
  },
  {
    key: 'skills',
    path: 'skills',
    label: 'Skills',
    type: 'multiSelect',
    operators: ['in', 'notIn', 'containsAll'],
    options: skillOptions,
    description: 'Technical and domain skills.',
  },
  {
    key: 'city',
    path: 'address.city',
    label: 'City',
    type: 'singleSelect',
    operators: ['is', 'isNot'],
    options: cityOptions,
    description: 'Nested object filter using dot notation.',
  },
];

export const employeeColumns: TableColumn<EmployeeRecord>[] = [
  {
    key: 'name',
    label: 'Name',
    path: 'name',
    minWidth: 190,
    render: (record) => (
      <Stack spacing={0.5}>
        <Typography sx={{ fontWeight: 600 }}>{record.name}</Typography>
        <Typography color="text.secondary" variant="body2">
          {record.email}
        </Typography>
      </Stack>
    ),
  },
  {
    key: 'department',
    label: 'Department',
    path: 'department',
    minWidth: 140,
  },
  {
    key: 'role',
    label: 'Role',
    path: 'role',
    minWidth: 180,
  },
  {
    key: 'salary',
    label: 'Salary',
    path: 'salary',
    minWidth: 130,
    align: 'right',
    sortAccessor: (record) => record.salary,
    render: (record) => formatCurrency(record.salary),
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    path: 'joinDate',
    minWidth: 130,
    sortAccessor: (record) => new Date(record.joinDate),
    render: (record) => formatDate(record.joinDate),
  },
  {
    key: 'city',
    label: 'City',
    path: 'address.city',
    minWidth: 130,
  },
  {
    key: 'skills',
    label: 'Skills',
    path: 'skills',
    minWidth: 240,
    render: (record) => (
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
        {record.skills.slice(0, 3).map((skill) => (
          <Chip key={skill} label={skill} size="small" variant="outlined" />
        ))}
        {record.skills.length > 3 ? (
          <Chip label={`+${record.skills.length - 3}`} size="small" variant="filled" />
        ) : null}
      </Stack>
    ),
  },
  {
    key: 'projects',
    label: 'Projects',
    path: 'projects',
    minWidth: 100,
    align: 'right',
  },
  {
    key: 'performanceRating',
    label: 'Rating',
    path: 'performanceRating',
    minWidth: 100,
    align: 'right',
  },
  {
    key: 'isActive',
    label: 'Active',
    path: 'isActive',
    minWidth: 100,
    render: (record) => (record.isActive ? 'Active' : 'Inactive'),
    sortAccessor: (record) => record.isActive,
  },
  {
    key: 'lastReview',
    label: 'Last Review',
    path: 'lastReview',
    minWidth: 130,
    sortAccessor: (record) => new Date(record.lastReview),
    render: (record) => formatDate(record.lastReview),
  },
];

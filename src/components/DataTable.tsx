import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import type { TableColumn } from '../types';
import { formatCellValue } from '../utils/formatting';
import { getValueByPath } from '../utils/object';

type SortDirection = 'asc' | 'desc';

interface DataTableProps<TRecord> {
  columns: TableColumn<TRecord>[];
  rows: TRecord[];
  title: string;
  totalCount: number;
}

const toComparableValue = (value: unknown): string | number => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (Array.isArray(value)) {
    return value.join(', ').toLowerCase();
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).toLowerCase();
};

const compareValues = (left: unknown, right: unknown, direction: SortDirection) => {
  const leftComparable = toComparableValue(left);
  const rightComparable = toComparableValue(right);

  if (leftComparable < rightComparable) {
    return direction === 'asc' ? -1 : 1;
  }

  if (leftComparable > rightComparable) {
    return direction === 'asc' ? 1 : -1;
  }

  return 0;
};

export const DataTable = <TRecord,>({
  columns,
  rows,
  title,
  totalCount,
}: DataTableProps<TRecord>) => {
  const [sortKey, setSortKey] = useState(columns[0]?.key ?? '');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedRows = useMemo(() => {
    const activeColumn = columns.find((column) => column.key === sortKey) ?? columns[0];

    if (!activeColumn) {
      return rows;
    }

    return [...rows].sort((left, right) => {
      const leftValue = activeColumn.sortAccessor
        ? activeColumn.sortAccessor(left)
        : activeColumn.path
          ? getValueByPath(left, activeColumn.path)
          : undefined;
      const rightValue = activeColumn.sortAccessor
        ? activeColumn.sortAccessor(right)
        : activeColumn.path
          ? getValueByPath(right, activeColumn.path)
          : undefined;

      return compareValues(leftValue, rightValue, sortDirection);
    });
  }, [columns, rows, sortDirection, sortKey]);

  const handleSort = (columnKey: string) => {
    if (columnKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(columnKey);
    setSortDirection('asc');
  };

  return (
    <Paper sx={{ overflow: 'hidden' }} variant="outlined">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        sx={{
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6">{title}</Typography>
          <Typography color="text.secondary" variant="body2">
            Showing {rows.length} of {totalCount} records
          </Typography>
        </Stack>
        <Typography color="text.secondary" variant="body2">
          Click any column header to sort the current filtered results.
        </Typography>
      </Stack>

      <TableContainer sx={{ maxHeight: 640 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align}
                  sx={{ minWidth: column.minWidth }}
                  sortDirection={sortKey === column.key ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortKey === column.key}
                    direction={sortKey === column.key ? sortDirection : 'asc'}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.length > 0 ? (
              sortedRows.map((row, index) => (
                <TableRow hover key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render
                        ? column.render(row)
                        : formatCellValue(column.path ? getValueByPath(row, column.path) : undefined)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
                    <Typography sx={{ fontWeight: 600 }}>No results found</Typography>
                    <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
                      Adjust or remove some filters to widen the dataset.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

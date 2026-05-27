import type { TableColumn } from '../types';
import { formatCellValue } from './formatting';
import { getValueByPath } from './object';

const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
};

export const exportRowsAsJson = <TRecord>(rows: TRecord[], fileName: string) => {
  downloadFile(JSON.stringify(rows, null, 2), fileName, 'application/json');
};

export const exportRowsAsCsv = <TRecord>(
  rows: TRecord[],
  columns: TableColumn<TRecord>[],
  fileName: string,
) => {
  const header = columns.map((column) => `"${column.label}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const rawValue = column.path ? getValueByPath(row, column.path) : column.render ? '' : '';
          const value = formatCellValue(rawValue).replaceAll('"', '""');
          return `"${value}"`;
        })
        .join(','),
    )
    .join('\n');

  downloadFile([header, body].join('\n'), fileName, 'text/csv;charset=utf-8');
};

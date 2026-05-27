import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Database, Download, RefreshCcw, Sparkles } from 'lucide-react';

import { DataTable } from './components/DataTable';
import { FilterBuilder } from './components/filter-builder/FilterBuilder';
import { employeeColumns, employeeFilterFields } from './config/employeeConfig';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { fetchEmployees } from './services/employees';
import type { EmployeeRecord, FilterCondition } from './types';
import { exportRowsAsCsv, exportRowsAsJson } from './utils/export';
import { filterRecords, getFieldMap, validateCondition } from './utils/filtering';

const STORAGE_KEY = 'edstruments-dynamic-filter-conditions';

const statCardStyles = {
  p: 2,
  minHeight: 116,
};

export default function App() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [conditions, setConditions] = useLocalStorageState<FilterCondition[]>(STORAGE_KEY, []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fieldMap = useMemo(() => getFieldMap(employeeFilterFields), []);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const records = await fetchEmployees();
      setEmployees(records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = useMemo(
    () => filterRecords(employees, conditions, employeeFilterFields),
    [conditions, employees],
  );

  const activeFilterCount = useMemo(
    () =>
      conditions.filter((condition) => {
        const field = fieldMap.get(condition.fieldKey);
        return field ? validateCondition(condition, field).isValid : false;
      }).length,
    [conditions, fieldMap],
  );

  const uniqueDepartments = useMemo(
    () => new Set(filteredEmployees.map((employee) => employee.department)).size,
    [filteredEmployees],
  );

  const activeCities = useMemo(
    () => new Set(filteredEmployees.map((employee) => employee.address.city)).size,
    [filteredEmployees],
  );

  const loadSampleFilters = () => {
    setConditions([
      {
        id: crypto.randomUUID(),
        fieldKey: 'department',
        operator: 'is',
        value: 'Engineering',
      },
      {
        id: crypto.randomUUID(),
        fieldKey: 'skills',
        operator: 'containsAll',
        value: ['React', 'TypeScript'],
      },
      {
        id: crypto.randomUUID(),
        fieldKey: 'isActive',
        operator: 'is',
        value: true,
      },
    ]);
  };

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Paper sx={{ p: { xs: 2.5, md: 4 } }} variant="outlined">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
              >
                <Stack spacing={1.5}>
                  <Chip
                    icon={<Database size={16} />}
                    label="Frontend Developer Assessment - Edstruments"
                    sx={{ alignSelf: 'flex-start' }}
                    variant="outlined"
                  />
                  <Typography variant="h3">Dynamic Filter Component System</Typography>
                  <Typography color="text.secondary" sx={{ maxWidth: 920 }} variant="body1">
                    A reusable, configuration-driven React 18 + TypeScript filter builder with
                    client-side filtering, nested object support, multi-type operators, local
                    persistence, exports, and a mock API backed by 50+ employee records.
                  </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    startIcon={<Sparkles size={16} />}
                    variant="contained"
                    onClick={loadSampleFilters}
                  >
                    Load sample filters
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<RefreshCcw size={16} />}
                    variant="outlined"
                    onClick={() => {
                      setConditions([]);
                      void loadEmployees();
                    }}
                  >
                    Reset demo
                  </Button>
                </Stack>
              </Stack>

              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label="React 18" size="small" />
                <Chip label="TypeScript" size="small" />
                <Chip label="Vite" size="small" />
                <Chip label="Material UI" size="small" />
                <Chip label="mock-json-api" size="small" />
                <Chip label="Local persistence" size="small" />
                <Chip label="CSV/JSON export" size="small" />
              </Stack>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            <Paper sx={statCardStyles} variant="outlined">
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="body2">
                  Total Records
                </Typography>
                <Typography variant="h4">{employees.length}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Served by the local mock API
                </Typography>
              </Stack>
            </Paper>
            <Paper sx={statCardStyles} variant="outlined">
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="body2">
                  Filtered Records
                </Typography>
                <Typography variant="h4">{filteredEmployees.length}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Updates in real time when conditions change
                </Typography>
              </Stack>
            </Paper>
            <Paper sx={statCardStyles} variant="outlined">
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="body2">
                  Active Filters
                </Typography>
                <Typography variant="h4">{activeFilterCount}</Typography>
                <Typography color="text.secondary" variant="body2">
                  AND across fields, OR within the same field
                </Typography>
              </Stack>
            </Paper>
            <Paper sx={statCardStyles} variant="outlined">
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="body2">
                  Result Coverage
                </Typography>
                <Typography variant="h4">
                  {uniqueDepartments} depts / {activeCities} cities
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Nested object and category diversity in the current result set
                </Typography>
              </Stack>
            </Paper>
          </Box>

          {isLoading ? <LinearProgress /> : null}

          {error ? (
            <Alert
              action={
                <Button color="inherit" size="small" onClick={() => void loadEmployees()}>
                  Retry
                </Button>
              }
              severity="error"
            >
              {error}
            </Alert>
          ) : null}

          <FilterBuilder
            conditions={conditions}
            fields={employeeFilterFields}
            onChange={setConditions}
          />

          <Paper sx={{ p: { xs: 2, md: 2.5 } }} variant="outlined">
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
            >
              <Typography color="text.secondary" variant="body2">
                Filters persist in local storage, and exports use the currently filtered dataset.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  disabled={filteredEmployees.length === 0}
                  startIcon={<Download size={16} />}
                  variant="outlined"
                  onClick={() =>
                    exportRowsAsCsv(filteredEmployees, employeeColumns, 'filtered-employees.csv')
                  }
                >
                  Export CSV
                </Button>
                <Button
                  disabled={filteredEmployees.length === 0}
                  startIcon={<Download size={16} />}
                  variant="outlined"
                  onClick={() => exportRowsAsJson(filteredEmployees, 'filtered-employees.json')}
                >
                  Export JSON
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <DataTable
            columns={employeeColumns}
            rows={filteredEmployees}
            title="Employee Directory"
            totalCount={employees.length}
          />
        </Stack>
      </Container>
    </Box>
  );
}

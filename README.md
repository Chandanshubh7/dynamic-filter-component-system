# Dynamic Filter Component System

This project is a submission-ready implementation of the Edstruments frontend assessment. It demonstrates a reusable, configuration-driven filter builder that can plug into any data table by changing the field definitions and columns instead of rewriting component logic.

## Stack

- React 18
- TypeScript
- Vite
- Material UI
- `mock-json-api`
- `lucide-react`

## Features

- Dynamic filter builder driven by field configuration
- Type-safe filter field definitions and table column metadata
- Support for text, number, currency, date, single-select, multi-select, and boolean filters
- AND logic across different fields and OR logic within the same field
- Nested object filtering via dot notation like `address.city`
- Real-time client-side filtering and sortable table output
- Local mock API serving 60 employee records from JSON
- Filter persistence in local storage
- CSV and JSON export for the currently filtered result set

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm run dev
```

This starts:

- Vite on `http://localhost:5173`
- The mock API on `http://localhost:3001`

### Production build

```bash
npm run build
```

## Project Structure

```text
src/
  components/
    filter-builder/
  config/
  hooks/
  services/
  types/
  utils/
mock-data/
scripts/
```

## Reusable Architecture

The app is intentionally split into reusable layers:

- `src/config/employeeConfig.tsx`
  - Defines filter fields, operators, options, and table columns
- `src/components/filter-builder/`
  - Renders field/operator/value controls dynamically from configuration
- `src/utils/filtering.ts`
  - Contains validation, matching, grouping logic, and record filtering
- `src/components/DataTable.tsx`
  - Generic sortable table for any row type and column config
- `src/services/employees.ts`
  - Fetches data from the mock API instead of importing JSON directly

## Filter Component Usage Example

The filter builder is reusable for any schema as long as you provide field metadata:

```tsx
<FilterBuilder
  conditions={conditions}
  fields={employeeFilterFields}
  onChange={setConditions}
/>
```

Each field definition controls how the UI behaves:

```tsx
{
  key: 'salary',
  path: 'salary',
  label: 'Salary',
  type: 'currency',
  operators: ['between'],
  description: 'Annual salary in USD.',
}
```

## Mock API

The mock server is implemented in `scripts/mock-api.cjs` and serves the local JSON file from `mock-data/employees.json`:

- `GET /api/employees`

The frontend fetches from `/api/employees`, and Vite proxies that request to the local API server during development.

## Notes

- The build has been verified with `npm run build`.
- The production bundle is somewhat large because Material UI and date picker dependencies are included together. If needed, this can be optimized further with code splitting.

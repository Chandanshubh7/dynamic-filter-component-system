const fs = require('node:fs');
const path = require('node:path');

const mock = require('mock-json-api');

const dataPath = path.join(__dirname, '..', 'mock-data', 'employees.json');
const port = Number(process.env.MOCK_API_PORT ?? 3001);

const readEmployees = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const buildPayload = (rows) => ({
  data: rows,
  meta: {
    total: rows.length,
    generatedAt: new Date().toISOString(),
  },
});

const mockApi = mock({
  logging: false,
  mockRoutes: [
    {
      name: 'getEmployees',
      mockRoute: '^/api/employees$',
      method: 'GET',
      testScope: 'success',
      jsonTemplate: () => JSON.stringify(buildPayload(readEmployees())),
    },
  ],
});

const app = mockApi.createServer();
const listener = app.listen(port, () => {
  console.log(`[mock-api] running on http://localhost:${port}`);
});

const shutdown = () => {
  listener.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

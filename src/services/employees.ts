import type { EmployeeApiResponse, EmployeeRecord } from '../types';

export const fetchEmployees = async (): Promise<EmployeeRecord[]> => {
  const response = await fetch('/api/employees');

  if (!response.ok) {
    throw new Error(`Failed to load employees (${response.status})`);
  }

  const payload = (await response.json()) as EmployeeApiResponse;
  return payload.data;
};

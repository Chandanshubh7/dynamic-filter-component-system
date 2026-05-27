import type { EmployeeApiResponse, EmployeeRecord } from '../types';

export const fetchEmployees = async (): Promise<EmployeeRecord[]> => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const endpoint = apiUrl.endsWith('.json') ? apiUrl : `${apiUrl}/api/employees`;
  
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to load employees (${response.status})`);
  }

  const payload = (await response.json()) as EmployeeApiResponse | EmployeeRecord[];
  
  // Handle both direct array (from JSON file) and API response format
  return Array.isArray(payload) ? payload : payload.data;
};

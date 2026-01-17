
import { Client, Project, Employee, Assignment, TimesheetEntry, Role } from './types';

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Acme Corp', code: 'ACM', address: '123 Sky Way', contactName: 'John Doe', contactEmail: 'john@acme.com', status: 'Active' },
  { id: 'c2', name: 'Globex', code: 'GBX', address: '456 Earth Rd', contactName: 'Jane Smith', contactEmail: 'jane@globex.com', status: 'Active' }
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', clientId: 'c1', code: 'ACM-CONS-01', name: 'Strategy Consulting', serviceType: 'Consulting', isBillable: true, status: 'Active', recoveryRate: 0.95 },
  { id: 'p2', clientId: 'c2', code: 'GBX-AUD-01', name: 'Annual Audit', serviceType: 'Audit', isBillable: true, status: 'Active', recoveryRate: 1.0 },
  { id: 'p3', clientId: 'c1', code: 'ACM-INT-01', name: 'Internal Training', serviceType: 'L&D', isBillable: false, status: 'Active', recoveryRate: 0 }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Sarah Wilson', role: 'Senior Consultant', skills: ['Strategy', 'Finance'], hourlyRate: 250, capacity: 40 },
  { id: 'e2', name: 'Michael Chen', role: 'Analyst', skills: ['Data', 'Excel'], hourlyRate: 150, capacity: 40 },
  { id: 'e3', name: 'Elena Rodriguez', role: 'Director', skills: ['Leadership', 'Sales'], hourlyRate: 400, capacity: 40 }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', employeeId: 'e1', projectId: 'p1', hoursPerWeek: 20, startDate: '2023-10-01', endDate: '2023-12-31' },
  { id: 'a2', employeeId: 'e2', projectId: 'p1', hoursPerWeek: 35, startDate: '2023-10-01', endDate: '2023-12-31' },
  { id: 'a3', employeeId: 'e1', projectId: 'p2', hoursPerWeek: 15, startDate: '2023-11-01', endDate: '2023-11-30' }
];

export const INITIAL_TIMESHEETS: TimesheetEntry[] = [
  { id: 't1', employeeId: 'e1', projectId: 'p1', date: '2023-10-25', hours: 8, description: 'Client meeting and drafting strategy doc', status: 'Approved', isBillable: true },
  { id: 't2', employeeId: 'e1', projectId: 'p1', date: '2023-10-26', hours: 6, description: 'Follow up research', status: 'Approved', isBillable: true },
  { id: 't3', employeeId: 'e2', projectId: 'p1', date: '2023-10-25', hours: 8, description: 'Data modeling', status: 'Approved', isBillable: true }
];

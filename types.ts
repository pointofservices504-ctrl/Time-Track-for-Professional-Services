
export enum Role {
  RESOURCE_MANAGER = 'Resource Manager',
  PROJECT_MANAGER = 'Project Manager',
  FINANCE = 'Finance',
  EMPLOYEE = 'Employee'
}

export interface Client {
  id: string;
  name: string;
  code: string;
  address: string;
  contactName: string;
  contactEmail: string;
  status: 'Active' | 'Inactive';
}

export interface Project {
  id: string;
  clientId: string;
  code: string;
  name: string;
  serviceType: string;
  isBillable: boolean;
  status: 'Active' | 'Pending' | 'Closed' | 'Internal';
  recoveryRate: number; // e.g., 0.9 for 90%
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  skills: string[];
  hourlyRate: number;
  capacity: number; // hours per week
}

export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: 'Annual Leave' | 'Sick Leave' | 'Public Holiday';
  startDate: string;
  endDate: string;
  hoursPerDay: number;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  isBillable: boolean;
}

export interface WIPRecord {
  projectId: string;
  clientName: string;
  projectCode: string;
  totalHours: number;
  wipAmount: number; // hours * rate * recovery
  lastUpdated: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'Draft' | 'Sent' | 'Paid';
  items: { description: string; amount: number }[];
}

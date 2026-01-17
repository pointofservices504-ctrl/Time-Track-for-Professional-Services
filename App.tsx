
import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Role, Client, Project, Employee, Assignment, TimesheetEntry, WIPRecord, Invoice 
} from './types';
import { 
  INITIAL_CLIENTS, INITIAL_PROJECTS, INITIAL_EMPLOYEES, INITIAL_ASSIGNMENTS, INITIAL_TIMESHEETS 
} from './mockData';

// Pages
import Dashboard from './components/Dashboard';
import CodeGenerator from './components/CodeGenerator';
import ResourcePlanner from './components/ResourcePlanner';
import TimesheetApp from './components/TimesheetApp';
import WIPLedger from './components/WIPLedger';

const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<Role>(Role.RESOURCE_MANAGER);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(INITIAL_TIMESHEETS);

  const contextValue = useMemo(() => ({
    currentUserRole,
    clients, setClients,
    projects, setProjects,
    employees, setEmployees,
    assignments, setAssignments,
    timesheets, setTimesheets
  }), [currentUserRole, clients, projects, employees, assignments, timesheets]);

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col fixed inset-y-0">
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">F</div>
            <span className="text-xl font-bold tracking-tight">FlowSync <span className="text-indigo-400">Pro</span></span>
          </div>

          <nav className="flex-1 mt-6 px-4 space-y-1">
            <SidebarLink to="/" icon={<DashboardIcon />} label="Dashboard" />
            <SidebarLink to="/codes" icon={<CodeIcon />} label="Code Generator" />
            <SidebarLink to="/planner" icon={<PlannerIcon />} label="Resource Planner" />
            <SidebarLink to="/timesheets" icon={<ClockIcon />} label="Timesheets" />
            <SidebarLink to="/billing" icon={<BillingIcon />} label="WIP & Billing" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-3">Viewing As</div>
            <select 
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as Role)}
              className="w-full bg-slate-800 text-sm border-none rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
            >
              {Object.values(Role).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                <img src={`https://picsum.photos/seed/${currentUserRole}/32/32`} alt="avatar" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium truncate">User Admin</div>
                <div className="text-xs text-slate-500 truncate">{currentUserRole}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard data={contextValue} />} />
            <Route path="/codes" element={<CodeGenerator data={contextValue} />} />
            <Route path="/planner" element={<ResourcePlanner data={contextValue} />} />
            <Route path="/timesheets" element={<TimesheetApp data={contextValue} />} />
            <Route path="/billing" element={<WIPLedger data={contextValue} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

// SVG Icons
const DashboardIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const CodeIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
);
const PlannerIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ClockIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const BillingIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
);

export default App;

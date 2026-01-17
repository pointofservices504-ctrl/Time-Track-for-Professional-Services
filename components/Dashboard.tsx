
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Role, Project, Employee, TimesheetEntry } from '../types';

interface DashboardProps {
  data: {
    currentUserRole: Role;
    projects: Project[];
    employees: Employee[];
    timesheets: TimesheetEntry[];
  };
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { currentUserRole, projects, employees, timesheets } = data;

  const stats = useMemo(() => {
    const totalWIP = timesheets
      .filter(t => t.status === 'Approved' && t.isBillable)
      .reduce((sum, t) => {
        const emp = employees.find(e => e.id === t.employeeId);
        const proj = projects.find(p => p.id === t.projectId);
        return sum + (t.hours * (emp?.hourlyRate || 0) * (proj?.recoveryRate || 1));
      }, 0);

    const billableHours = timesheets.filter(t => t.isBillable).reduce((sum, t) => sum + t.hours, 0);
    const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);
    const utilization = totalHours > 0 ? (billableHours / (employees.length * 40)) * 100 : 0;

    return {
      totalWIP,
      billableHours,
      activeProjects: projects.filter(p => p.status === 'Active').length,
      utilization: Math.round(utilization)
    };
  }, [timesheets, employees, projects]);

  const chartData = [
    { name: 'Week 1', billable: 450, internal: 120 },
    { name: 'Week 2', billable: 520, internal: 90 },
    { name: 'Week 3', billable: 480, internal: 150 },
    { name: 'Week 4', billable: 600, internal: 110 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Enterprise Overview</h1>
          <p className="text-slate-500 mt-1">Key performance indicators for your firm</p>
        </div>
        <div className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium border border-indigo-100">
          Last updated: Today, 09:42 AM
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Accumulated WIP" value={`$${stats.totalWIP.toLocaleString()}`} change="+12%" type="positive" />
        <StatCard label="Billable Hours" value={stats.billableHours.toString()} change="+5.4%" type="positive" />
        <StatCard label="Resource Utilization" value={`${stats.utilization}%`} change="-2%" type="negative" />
        <StatCard label="Active Projects" value={stats.activeProjects.toString()} change="+1" type="positive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Utilization Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            <span>Utilization Trends</span>
            <select className="text-sm bg-slate-50 border-slate-200 rounded p-1">
              <option>Last 4 Weeks</option>
              <option>Last 3 Months</option>
            </select>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" />
                <Bar name="Billable" dataKey="billable" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar name="Internal" dataKey="internal" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WIP Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">WIP by Service Line</h3>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Consulting', value: 45 },
                    { name: 'Audit', value: 30 },
                    { name: 'Tax', value: 15 },
                    { name: 'L&D', value: 10 }
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold">$124k</div>
                <div className="text-xs text-slate-400">Total WIP</div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
               { name: 'Consulting', val: '45%', color: '#6366f1' },
               { name: 'Audit', val: '30%', color: '#10b981' },
               { name: 'Tax', val: '15%', color: '#f59e0b' }
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Critical Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlertCard 
            title="WIP Over 30 Days" 
            desc="Acme Corp (ACM-CONS-01) has $12,400 unbilled for 35 days."
            type="warning" 
          />
          <AlertCard 
            title="Overcapacity Warning" 
            desc="Sarah Wilson is allocated at 115% for the next 2 weeks."
            type="danger" 
          />
          <AlertCard 
            title="Missing Timesheets" 
            desc="4 employees have not submitted timesheets for Week 42."
            type="info" 
          />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, change, type }: { label: string; value: string; change: string; type: 'positive' | 'negative' }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="text-sm font-medium text-slate-500 mb-2">{label}</div>
    <div className="flex items-end justify-between">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
        type === 'positive' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}>
        {change}
      </div>
    </div>
  </div>
);

const AlertCard = ({ title, desc, type }: { title: string; desc: string; type: 'warning' | 'danger' | 'info' }) => {
  const styles = {
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-900',
    info: 'border-blue-200 bg-blue-50 text-blue-900'
  };
  return (
    <div className={`p-4 rounded-lg border flex items-start space-x-3 ${styles[type]}`}>
      <div className="mt-1">
        {type === 'danger' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
        {type === 'warning' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
        {type === 'info' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
      </div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs mt-0.5 opacity-80">{desc}</div>
      </div>
    </div>
  );
};

export default Dashboard;

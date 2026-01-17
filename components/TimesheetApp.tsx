
import React, { useState, useEffect, useMemo } from 'react';
import { Role, TimesheetEntry, Project, Employee, Assignment } from '../types';

interface TimesheetAppProps {
  data: {
    currentUserRole: Role;
    timesheets: TimesheetEntry[];
    setTimesheets: React.Dispatch<React.SetStateAction<TimesheetEntry[]>>;
    projects: Project[];
    employees: Employee[];
    assignments: Assignment[];
  };
}

// Define the static week for the demo
const WEEK_DATES = [
  { label: 'Mon', date: '2023-10-23' },
  { label: 'Tue', date: '2023-10-24' },
  { label: 'Wed', date: '2023-10-25' },
  { label: 'Thu', date: '2023-10-26' },
  { label: 'Fri', date: '2023-10-27' },
];

const TimesheetApp: React.FC<TimesheetAppProps> = ({ data }) => {
  const { timesheets, setTimesheets, projects, employees, assignments, currentUserRole } = data;
  const [activeTab, setActiveTab] = useState<'entry' | 'approvals'>(
    currentUserRole === Role.EMPLOYEE ? 'entry' : 'approvals'
  );
  
  // For this demo, let's assume we are acting as Sarah Wilson (e1)
  const currentEmployeeId = 'e1';
  
  // Local state for the grid: {[projectId]: {[date]: hours}}
  const [gridData, setGridData] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Get assigned projects for the current user
  const myAssignedProjectIds = assignments
    .filter(a => a.employeeId === currentEmployeeId)
    .map(a => a.projectId);
  
  const myProjects = useMemo(() => projects.filter(p => myAssignedProjectIds.includes(p.id) || !p.isBillable), [projects, myAssignedProjectIds]);

  // Initial load: populate grid from global timesheets
  useEffect(() => {
    const initialGrid: Record<string, Record<string, string>> = {};
    
    timesheets
      .filter(t => t.employeeId === currentEmployeeId)
      .forEach(t => {
        if (!initialGrid[t.projectId]) initialGrid[t.projectId] = {};
        initialGrid[t.projectId][t.date] = t.hours.toString();
      });
      
    setGridData(initialGrid);
  }, [timesheets, currentEmployeeId]);

  const handleInputChange = (projectId: string, date: string, value: string) => {
    // Only allow numbers and decimals
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    
    setGridData(prev => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {}),
        [date]: value
      }
    }));
  };

  const getRowTotal = (projectId: string): number => {
    const rows = gridData[projectId] || {};
    return Object.values(rows).reduce<number>((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const getColumnTotal = (date: string): number => {
    return Object.keys(gridData).reduce<number>((sum, projId) => {
      // Fix: Ensure we treat the grid value as a string explicitly to satisfy TypeScript
      const val = (gridData[projId]?.[date] as string) || '0';
      return sum + (parseFloat(val) || 0);
    }, 0);
  };

  const handleProcessSubmission = (status: 'Draft' | 'Submitted') => {
    setIsSaving(true);
    
    const newEntries: TimesheetEntry[] = [];
    
    Object.entries(gridData).forEach(([projectId, dates]) => {
      Object.entries(dates).forEach(([date, hoursStr]) => {
        const hours = parseFloat(hoursStr);
        if (hours > 0) {
          const project = projects.find(p => p.id === projectId);
          newEntries.push({
            id: `t-${currentEmployeeId}-${projectId}-${date}`,
            employeeId: currentEmployeeId,
            projectId,
            date,
            hours,
            description: 'Weekly time entry',
            status,
            isBillable: project?.isBillable ?? true
          });
        }
      });
    });

    setTimesheets(prev => {
      const otherEntries = prev.filter(t => 
        t.employeeId !== currentEmployeeId || 
        !WEEK_DATES.some(wd => wd.date === t.date)
      );
      return [...otherEntries, ...newEntries];
    });

    setTimeout(() => {
      setIsSaving(false);
      alert(status === 'Submitted' ? 'Timesheet submitted for approval!' : 'Draft saved successfully.');
    }, 600);
  };

  const handleApprove = (id: string) => {
    setTimesheets(prev => prev.map(t => t.id === id ? { ...t, status: 'Approved' } : t));
  };

  const handleReject = (id: string) => {
    setTimesheets(prev => prev.map(t => t.id === id ? { ...t, status: 'Rejected' } : t));
  };

  const pendingApprovals = timesheets.filter(t => t.status === 'Submitted');

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Management</h1>
          <p className="text-slate-500">Log billable hours and track work-in-progress</p>
        </div>
        <div className="flex p-1 bg-slate-200/50 rounded-xl">
          <button 
            onClick={() => setActiveTab('entry')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'entry' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Entries
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center space-x-2 ${activeTab === 'approvals' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span>Approvals</span>
            {pendingApprovals.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {activeTab === 'entry' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Period</div>
                <div className="flex items-center space-x-3">
                  <h3 className="font-bold text-slate-800">Week 43</h3>
                  <span className="text-sm text-slate-500 font-medium">Oct 23 — Oct 27, 2023</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-sm font-bold text-slate-700">Draft</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleProcessSubmission('Draft')}
                disabled={isSaving}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                onClick={() => handleProcessSubmission('Submitted')}
                disabled={isSaving}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Submitting...' : 'Submit Week'}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-1/3 border-b border-slate-100">Project / Work Code</th>
                  {WEEK_DATES.map(wd => (
                    <th key={wd.date} className="px-2 py-4 text-center border-b border-slate-100">
                      <div>{wd.label}</div>
                      <div className="text-[9px] opacity-60 font-medium">{wd.date.split('-').slice(1).join('/')}</div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center border-b border-slate-100">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myProjects.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{proj.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{proj.code}</div>
                        {!proj.isBillable && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Non-Billable</span>}
                      </div>
                    </td>
                    {WEEK_DATES.map(wd => (
                      <td key={wd.date} className="px-2 py-5">
                        <input 
                          type="text" 
                          placeholder="0.0"
                          value={gridData[proj.id]?.[wd.date] || ''}
                          onChange={(e) => handleInputChange(proj.id, wd.date, e.target.value)}
                          className={`w-14 mx-auto block text-center border-2 rounded-xl py-2 text-sm font-bold transition-all focus:outline-none focus:ring-0 ${
                            gridData[proj.id]?.[wd.date] 
                              ? 'border-indigo-100 bg-indigo-50/30 text-indigo-700 focus:border-indigo-400' 
                              : 'border-slate-100 bg-slate-50/50 text-slate-400 focus:border-indigo-200'
                          }`}
                        />
                      </td>
                    ))}
                    <td className="px-6 py-5 text-center">
                      <div className="font-extrabold text-slate-900 text-lg">
                        {getRowTotal(proj.id).toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white">
                <tr className="font-bold">
                  <td className="px-6 py-6">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Capacity Utilization</div>
                    <div className="text-sm">Standard: 40.0h</div>
                  </td>
                  {WEEK_DATES.map(wd => {
                    const colTotal = getColumnTotal(wd.date);
                    return (
                      <td key={wd.date} className="px-2 py-6 text-center">
                        <div className={`text-lg ${colTotal > 8 ? 'text-amber-400' : 'text-white'}`}>
                          {colTotal.toFixed(1)}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase">Hrs</div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-6 text-center bg-indigo-600">
                    <div className="text-xl font-black italic">
                      {WEEK_DATES.reduce<number>((sum, wd) => sum + getColumnTotal(wd.date), 0).toFixed(1)}
                    </div>
                    <div className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">Week Total</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800 flex justify-between items-center">
             <div>
               <h3 className="text-lg font-bold">Approvals Pipeline</h3>
               <p className="text-indigo-200 text-sm">Reviewing {pendingApprovals.length} pending time entries.</p>
             </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Hours</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.map(t => {
                  const emp = employees.find(e => e.id === t.employeeId);
                  const proj = projects.find(p => p.id === t.projectId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <img src={`https://picsum.photos/seed/${t.employeeId}/40/40`} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
                          <div>
                            <span className="font-bold text-slate-900 block">{emp?.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{emp?.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-800">{proj?.name}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{t.date}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg font-black text-sm">{t.hours.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-2">
                         <button onClick={() => handleReject(t.id)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                         <button onClick={() => handleApprove(t.id)} className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetApp;

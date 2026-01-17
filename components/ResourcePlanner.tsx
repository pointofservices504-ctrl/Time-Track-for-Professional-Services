
import React, { useState, useMemo } from 'react';
import { Role, Employee, Project, Assignment, Leave } from '../types';

interface ResourcePlannerProps {
  data: {
    currentUserRole: Role;
    employees: Employee[];
    projects: Project[];
    assignments: Assignment[];
    setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  };
}

const ResourcePlanner: React.FC<ResourcePlannerProps> = ({ data }) => {
  const { employees, projects, assignments, setAssignments } = data;
  const [activeTab, setActiveTab] = useState<'timeline' | 'availability'>('timeline');
  const [selectedWeek, setSelectedWeek] = useState('2023-10-23'); // Monday of the week
  
  // Mock leave data for demonstration
  const [leaves] = useState<Leave[]>([
    { id: 'l1', employeeId: 'e2', type: 'Annual Leave', startDate: '2023-10-23', endDate: '2023-10-25', hoursPerDay: 8 }
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Partial<Assignment> | null>(null);

  const employeeStats = useMemo(() => {
    return employees.map(emp => {
      const empAssignments = assignments.filter(a => a.employeeId === emp.id);
      const empLeaves = leaves.filter(l => l.employeeId === emp.id);
      
      const allocatedHours = empAssignments.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      const leaveHoursPerWeek = empLeaves.reduce((sum, l) => sum + (l.hoursPerDay * 1), 0); // Simplified calc
      
      const totalLoad = allocatedHours + leaveHoursPerWeek;
      const utilization = (totalLoad / emp.capacity) * 100;
      
      const weeklyRevenue = empAssignments.reduce((sum, a) => {
        const proj = projects.find(p => p.id === a.projectId);
        return sum + (a.hoursPerWeek * emp.hourlyRate * (proj?.recoveryRate || 0));
      }, 0);

      return { ...emp, allocatedHours, utilization, weeklyRevenue, empAssignments, empLeaves, totalLoad };
    });
  }, [employees, assignments, projects, leaves]);

  const totalAllocated = useMemo(() => 
    assignments.reduce((sum, a) => sum + a.hoursPerWeek, 0), 
    [assignments]
  );
  
  const totalCapacity = useMemo(() => 
    employees.reduce((sum, e) => sum + e.capacity, 0), 
    [employees]
  );

  const handleOpenAddModal = (employeeId: string) => {
    setEditingAssignment({
      employeeId,
      projectId: projects[0]?.id || '',
      hoursPerWeek: 8,
      startDate: selectedWeek,
      endDate: '2023-11-23'
    });
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    if (editingAssignment.id) {
      setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? editingAssignment as Assignment : a));
    } else {
      const newAss: Assignment = {
        ...editingAssignment as Assignment,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAssignments(prev => [...prev, newAss]);
    }
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      setAssignments(prev => prev.filter(a => a.id !== id));
    }
  };

  // Helper to find existing work for the selected employee in the modal
  const conflictDetails = useMemo(() => {
    if (!editingAssignment?.employeeId) return { assignments: [], leaves: [], total: 0 };
    const empId = editingAssignment.employeeId;
    const existing = assignments.filter(a => a.employeeId === empId && a.id !== editingAssignment.id);
    const existingLeaves = leaves.filter(l => l.employeeId === empId);
    const total = existing.reduce((s, a) => s + a.hoursPerWeek, 0) + existingLeaves.reduce((s, l) => s + (l.hoursPerDay * 5), 0); // Multiplied for week
    return { assignments: existing, leaves: existingLeaves, total };
  }, [editingAssignment, assignments, leaves]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resource Planner</h1>
          <p className="text-slate-500">Visual scheduling and team capacity management</p>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'timeline' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Project Timeline
          </button>
          <button 
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'availability' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Team Availability
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Capacity</div>
          <div className="text-xl font-bold text-slate-900">{totalCapacity}h / wk</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Load</div>
          <div className="text-xl font-bold text-indigo-600">{totalAllocated}h</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Util</div>
          <div className="text-xl font-bold text-emerald-600">{Math.round((totalAllocated / totalCapacity) * 100)}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Projection</div>
          <div className="text-xl font-bold text-slate-900">${employeeStats.reduce((s, e) => s + e.weeklyRevenue, 0).toLocaleString()}</div>
        </div>
      </div>

      {activeTab === 'timeline' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <th className="px-6 py-4 text-left min-w-[200px] sticky left-0 bg-slate-50 z-10">Resource</th>
                <th className="px-6 py-4 text-center">Utilization</th>
                <th className="px-4 py-4 text-center">M</th>
                <th className="px-4 py-4 text-center">T</th>
                <th className="px-4 py-4 text-center">W</th>
                <th className="px-4 py-4 text-center">T</th>
                <th className="px-4 py-4 text-center">F</th>
                <th className="px-6 py-4 text-left min-w-[300px]">Active Assignments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeStats.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50">
                    <div className="flex items-center space-x-3">
                      <img src={`https://picsum.photos/seed/${emp.id}/40/40`} className="w-8 h-8 rounded-full" alt="" />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">{emp.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 mx-auto">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${emp.utilization > 100 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${Math.min(emp.utilization, 100)}%` }} 
                        />
                      </div>
                      <div className="text-[10px] text-center mt-1 font-bold text-slate-600">{Math.round(emp.utilization)}%</div>
                    </div>
                  </td>
                  {[1,2,3,4,5].map(d => (
                    <td key={d} className="px-2 py-4 text-center">
                      <div className="w-8 h-8 rounded border border-slate-100 bg-slate-50 flex items-center justify-center text-[11px] font-bold text-slate-400">
                        8
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {emp.empAssignments.map(a => (
                        <div key={a.id} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[11px] font-bold border border-indigo-100 flex items-center space-x-1">
                          <span>{projects.find(p => p.id === a.projectId)?.code}</span>
                          <span className="opacity-40">|</span>
                          <span>{a.hoursPerWeek}h</span>
                        </div>
                      ))}
                      {emp.empLeaves.map(l => (
                        <div key={l.id} className="bg-rose-50 text-rose-700 px-2 py-1 rounded text-[11px] font-bold border border-rose-100">
                          {l.type}
                        </div>
                      ))}
                      <button 
                        onClick={() => handleOpenAddModal(emp.id)}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeeStats.map(emp => (
            <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <img src={`https://picsum.photos/seed/${emp.id}/48/48`} className="w-12 h-12 rounded-full border-2 border-slate-100" alt="" />
                  <div>
                    <h3 className="font-bold text-slate-900">{emp.name}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{emp.role}</p>
                  </div>
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full ${emp.utilization > 95 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {Math.round(emp.utilization)}% Load
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Weekly Projects</div>
                    <div className="text-sm font-bold text-slate-700">{emp.empAssignments.length} Active</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avail. Hours</div>
                    <div className="text-sm font-bold text-slate-700">{Math.max(0, emp.capacity - emp.totalLoad)}h Left</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Current Assignments</div>
                  {emp.empAssignments.length === 0 && <div className="text-xs italic text-slate-400">No active projects</div>}
                  {emp.empAssignments.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-xs font-bold text-slate-700">{projects.find(p => p.id === a.projectId)?.name}</div>
                      <div className="text-xs font-bold text-indigo-600">{a.hoursPerWeek}h</div>
                    </div>
                  ))}
                  {emp.empLeaves.map(l => (
                    <div key={l.id} className="flex justify-between items-center bg-rose-50 p-2 rounded-lg border border-rose-100">
                      <div className="text-xs font-bold text-rose-700">{l.type}</div>
                      <div className="text-xs font-bold text-rose-600">{l.hoursPerDay * 5}h</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenAddModal(emp.id)}
                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Modify Schedule
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Booking Modal */}
      {isModalOpen && editingAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Left Panel: Configuration */}
            <div className="flex-1 p-8 border-r border-slate-100">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Configure Assignment</h2>
                <p className="text-sm text-slate-500 mt-1">Resource: {employees.find(e => e.id === editingAssignment.employeeId)?.name}</p>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Target Project</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700"
                    value={editingAssignment.projectId}
                    onChange={(e) => setEditingAssignment({...editingAssignment, projectId: e.target.value})}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Month Week Selection</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(w => (
                        <button 
                          key={w}
                          type="button"
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${w === 4 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                          W{w}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Hours Per Week</label>
                    <input 
                      type="number" 
                      min="1" max="40"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                      value={editingAssignment.hoursPerWeek}
                      onChange={(e) => setEditingAssignment({...editingAssignment, hoursPerWeek: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  >
                    Save Booking
                  </button>
                </div>
              </form>
            </div>

            {/* Right Panel: Braid-inspired Capacity Preview */}
            <div className="w-full md:w-80 bg-slate-50 p-8">
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Weekly Capacity Load</h3>
              
              <div className="space-y-6">
                {/* Visual Capacity Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Utilization</span>
                    <span>{conflictDetails.total + (editingAssignment.hoursPerWeek || 0)} / 40h</span>
                  </div>
                  <div className="h-6 w-full bg-slate-200 rounded-lg overflow-hidden flex relative shadow-inner">
                    <div 
                      className="h-full bg-slate-400 border-r border-slate-500/20" 
                      style={{ width: `${(conflictDetails.total / 40) * 100}%` }} 
                      title="Existing Load"
                    />
                    <div 
                      className="h-full bg-indigo-500 animate-pulse" 
                      style={{ width: `${((editingAssignment.hoursPerWeek || 0) / 40) * 100}%` }} 
                      title="Proposed Addition"
                    />
                    {(conflictDetails.total + (editingAssignment.hoursPerWeek || 0)) > 40 && (
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-rose-500" />
                    )}
                  </div>
                </div>

                {/* Conflict Details */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Existing Blockers</div>
                  {conflictDetails.assignments.map(a => (
                    <div key={a.id} className="flex items-center space-x-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <div className="flex-1 font-semibold text-slate-600">{projects.find(p => p.id === a.projectId)?.code}</div>
                      <div className="font-bold text-slate-900">{a.hoursPerWeek}h</div>
                    </div>
                  ))}
                  {conflictDetails.leaves.map(l => (
                    <div key={l.id} className="flex items-center space-x-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                      <div className="flex-1 font-semibold text-rose-700">{l.type}</div>
                      <div className="font-bold text-rose-700">{l.hoursPerDay * 5}h</div>
                    </div>
                  ))}
                  {conflictDetails.total === 0 && <div className="text-xs italic text-slate-400">Clear week schedule</div>}
                </div>

                {/* Conflict Alert */}
                {(conflictDetails.total + (editingAssignment.hoursPerWeek || 0)) > 40 && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-[10px] font-bold flex items-start space-x-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>CRITICAL: Resource exceeds 40h capacity for the selected week. Review or split the assignment.</span>
                  </div>
                )}

                <div className="p-4 bg-indigo-900 text-white rounded-2xl shadow-xl">
                  <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Financial Preview</div>
                  <div className="text-lg font-bold">
                    ${((editingAssignment.hoursPerWeek || 0) * (employees.find(e => e.id === editingAssignment.employeeId)?.hourlyRate || 0) * (projects.find(p => p.id === editingAssignment.projectId)?.recoveryRate || 0)).toLocaleString()}
                  </div>
                  <div className="text-[10px] opacity-60 mt-1">Est. Revenue Contribution</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;

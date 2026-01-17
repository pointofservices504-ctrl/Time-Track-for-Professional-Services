
import React, { useMemo, useState } from 'react';
import { Role, TimesheetEntry, Project, Employee, Client, WIPRecord, Invoice } from '../types';

interface WIPLedgerProps {
  data: {
    currentUserRole: Role;
    timesheets: TimesheetEntry[];
    projects: Project[];
    employees: Employee[];
    clients: Client[];
  };
}

const WIPLedger: React.FC<WIPLedgerProps> = ({ data }) => {
  const { timesheets, projects, employees, clients } = data;
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const wipData = useMemo(() => {
    const records: Record<string, WIPRecord> = {};

    timesheets.filter(t => t.status === 'Approved' && t.isBillable).forEach(t => {
      const proj = projects.find(p => p.id === t.projectId);
      const emp = employees.find(e => e.id === t.employeeId);
      const client = clients.find(c => c.id === proj?.clientId);

      if (proj && emp && client) {
        if (!records[proj.id]) {
          records[proj.id] = {
            projectId: proj.id,
            clientName: client.name,
            projectCode: proj.code,
            totalHours: 0,
            wipAmount: 0,
            lastUpdated: t.date
          };
        }
        records[proj.id].totalHours += t.hours;
        records[proj.id].wipAmount += (t.hours * emp.hourlyRate * proj.recoveryRate);
      }
    });

    return Object.values(records);
  }, [timesheets, projects, employees, clients]);

  const handleGenerateInvoice = (wip: WIPRecord) => {
    const newInvoice: Invoice = {
      id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
      clientId: projects.find(p => p.id === wip.projectId)?.clientId || '',
      clientName: wip.clientName,
      amount: wip.wipAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      items: [
        { description: `Professional Services for ${wip.projectCode}`, amount: wip.wipAmount }
      ]
    };
    setInvoices([newInvoice, ...invoices]);
    alert(`Draft Invoice generated for ${wip.clientName}: $${wip.wipAmount.toLocaleString()}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">WIP & Billing Engine</h1>
        <p className="text-slate-500">Real-time work-in-progress accumulation and reconciliation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Total Unbilled WIP</div>
          <div className="text-2xl font-bold text-slate-900">
            ${wipData.reduce((sum, w) => sum + w.wipAmount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Weighted Recovery</div>
          <div className="text-2xl font-bold text-slate-900 text-emerald-600">92.4%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Aging > 30 Days</div>
          <div className="text-2xl font-bold text-slate-900 text-amber-600">$18,400</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Draft Invoices</div>
          <div className="text-2xl font-bold text-slate-900">{invoices.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Active WIP Ledger</h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                <th className="px-6 py-3">Client / Project</th>
                <th className="px-6 py-3">Total Hours</th>
                <th className="px-6 py-3">WIP Amount</th>
                <th className="px-6 py-3">Recovery Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wipData.map(record => (
                <tr key={record.projectId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{record.clientName}</div>
                    <div className="text-xs font-mono font-bold text-indigo-500">{record.projectCode}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{record.totalHours} hrs</td>
                  <td className="px-6 py-4 font-bold text-slate-900">${record.wipAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{width: '95%'}}></div>
                       </div>
                       <span className="text-[10px] font-bold text-emerald-600">Healthy</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleGenerateInvoice(record)}
                      className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md font-bold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      Generate Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recent Draft Invoices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{inv.id} - {inv.clientName}</div>
                    <div className="text-sm text-slate-500">Created {inv.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">${inv.amount.toLocaleString()}</div>
                  <button className="text-indigo-600 text-xs font-bold hover:underline">Preview & Send</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WIPLedger;

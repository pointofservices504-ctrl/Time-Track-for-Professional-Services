
import React, { useState } from 'react';
import { Role, Client, Project } from '../types';

interface CodeGeneratorProps {
  data: {
    currentUserRole: Role;
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  };
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ data }) => {
  const { clients, setClients, projects, setProjects } = data;
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', code: '', address: '', contact: '' });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name,
      code: newClient.code.toUpperCase(),
      address: newClient.address,
      contactName: newClient.contact,
      contactEmail: `${newClient.contact.toLowerCase().replace(' ', '.')}@example.com`,
      status: 'Active'
    };
    setClients([...clients, client]);
    setNewClient({ name: '', code: '', address: '', contact: '' });
    setIsAddingClient(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Code Generator</h1>
          <p className="text-slate-500">Single source of truth for client and project identifiers</p>
        </div>
        <button 
          onClick={() => setIsAddingClient(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>Register New Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clients Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Master Client List</h3>
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="text-sm border-slate-200 rounded-md py-1 px-3 focus:ring-indigo-500 w-48" 
            />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 bg-slate-50 font-bold">
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Client Name</th>
                <th className="px-6 py-3">Primary Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-indigo-600">{client.code}</td>
                  <td className="px-6 py-4 font-medium">{client.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{client.contactName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Project Code Structure Guide */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg self-start">
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Code Standard (ISO)</span>
          </h3>
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-800 rounded-lg">
              <div className="text-indigo-400 font-bold text-xs uppercase mb-1">Standard Project</div>
              <code className="text-lg">[CLI]-[SRV]-[SEQ]</code>
              <p className="mt-1 text-slate-400">Example: <span className="text-white">ACM-CONS-01</span></p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg">
              <div className="text-indigo-400 font-bold text-xs uppercase mb-1">Internal Code</div>
              <code className="text-lg">PA-[TYPE]-[SEQ]</code>
              <p className="mt-1 text-slate-400">Example: <span className="text-white">PA-ADMIN-01</span></p>
            </div>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>• Codes must be unique firm-wide</li>
              <li>• Internal codes must use the 'PA' prefix</li>
              <li>• Service codes: CONS, AUD, TAX, LD</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Register New Client</h2>
              <button onClick={() => setIsAddingClient(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                <input 
                  required
                  type="text" 
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full border-slate-300 rounded-lg focus:ring-indigo-500" 
                  placeholder="e.g. Stark Industries"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code (3 Chars)</label>
                  <input 
                    required
                    maxLength={3}
                    type="text" 
                    value={newClient.code}
                    onChange={(e) => setNewClient({...newClient, code: e.target.value.toUpperCase()})}
                    className="w-full border-slate-300 rounded-lg focus:ring-indigo-500 uppercase" 
                    placeholder="e.g. STR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Contact</label>
                  <input 
                    required
                    type="text" 
                    value={newClient.contact}
                    onChange={(e) => setNewClient({...newClient, contact: e.target.value})}
                    className="w-full border-slate-300 rounded-lg focus:ring-indigo-500" 
                    placeholder="Pepper Potts"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <textarea 
                  required
                  rows={3}
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  className="w-full border-slate-300 rounded-lg focus:ring-indigo-500"
                  placeholder="10880 Malibu Point..."
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Generate Client ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;

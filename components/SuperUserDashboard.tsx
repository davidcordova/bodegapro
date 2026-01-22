
import React, { useState } from 'react';
import type { TenantData, User } from '../types';
import { CreditCardIcon } from './Icons';

interface SuperUserDashboardProps {
    allTenants: Record<string, TenantData>;
    onCreateTenant: (tenantId: string, adminUser: User, maxUsers: number) => void;
    onLogout: () => void;
}

const SuperUserDashboard: React.FC<SuperUserDashboardProps> = ({ allTenants, onCreateTenant, onLogout }) => {
    const [tenantId, setTenantId] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [maxUsers, setMaxUsers] = useState(1);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!tenantId.trim() || !adminUsername.trim() || !adminPassword.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        try {
            onCreateTenant(tenantId, { username: adminUsername, password: adminPassword, role: 'admin' }, maxUsers);
            setTenantId('');
            setAdminUsername('');
            setAdminPassword('');
            setMaxUsers(1);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
             <header className="bg-primary-900 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                         <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                           <span className='flex items-center gap-2'><CreditCardIcon className="h-8 w-8"/> Panel de Superusuario</span>
                        </h1>
                        <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nueva Bodega</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre de la Bodega (ID único)</label>
                                <input type="text" value={tenantId} onChange={e => setTenantId(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuario Administrador</label>
                                <input type="text" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña del Administrador</label>
                                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Máximo de Usuarios</label>
                                <input type="number" value={maxUsers} onChange={e => setMaxUsers(parseInt(e.target.value, 10))} className="mt-1 w-full p-2 border rounded-md" min="1" required />
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-2 rounded-md hover:bg-primary-700">Crear Bodega</button>
                        </form>
                    </div>
                </div>
                <div className="md:col-span-2">
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Bodegas Registradas</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left">Nombre Bodega</th>
                                        <th className="py-2 px-4 text-left">Admin</th>
                                        <th className="py-2 px-4 text-center">Usuarios</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* FIX: Explicitly type the destructured array from Object.entries to correct the type inference of 'data'. */}
                                    {Object.entries(allTenants).map(([id, data]: [string, TenantData]) => (
                                        <tr key={id} className="border-b">
                                            <td className="py-2 px-4 font-semibold">{id}</td>
                                            <td className="py-2 px-4">{data.users.find(u => u.role === 'admin')?.username}</td>
                                            <td className="py-2 px-4 text-center">{data.users.length} / {data.maxUsers}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperUserDashboard;
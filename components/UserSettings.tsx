
import React, { useState } from 'react';
import type { User } from '../types';
import { PlusIcon } from './Icons';

interface UserSettingsProps {
    users: User[];
    maxUsers: number;
    onAddUser: (user: User) => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ users, maxUsers, onAddUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const canAddUser = users.length < maxUsers;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!canAddUser) {
            setError('Ha alcanzado el límite de usuarios.');
            return;
        }
        if (users.some(u => u.username === username)) {
            setError('El nombre de usuario ya existe.');
            return;
        }
        if (username.trim() && password.trim()) {
            onAddUser({ username, password, role: 'staff' });
            setUsername('');
            setPassword('');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">Añadir Usuario</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Límite de usuarios: <strong>{users.length} / {maxUsers}</strong>
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                             <label className="text-sm font-medium">Nombre de Usuario</label>
                             <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded-md mt-1" required />
                        </div>
                        <div>
                             <label className="text-sm font-medium">Contraseña</label>
                             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md mt-1" required />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" disabled={!canAddUser} className="w-full bg-primary-600 text-white font-bold py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            <PlusIcon className="h-5 w-5"/> Crear Usuario
                        </button>
                    </form>
                </div>
            </div>
             <div className="md:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Usuarios de la Bodega</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                         <thead className="bg-slate-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.username} className="hover:bg-gray-50">
                                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{user.username}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-gray-700 capitalize">{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;

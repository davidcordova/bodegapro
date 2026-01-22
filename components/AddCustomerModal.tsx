
import React, { useState } from 'react';
import type { Customer } from '../types';

interface AddCustomerModalProps {
    onSave: (customer: Omit<Customer, 'id'|'balance'>) => void;
    onCancel: () => void;
    existingUsernames: string[];
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onSave, onCancel, existingUsernames }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (existingUsernames.includes(username.trim().toLowerCase())) {
            setError('Este nombre de usuario ya existe.');
            return;
        }
        onSave({ name: name.trim(), username: username.trim(), password: password.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Nuevo Cliente</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de Usuario (para su acceso)</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña (para su acceso)</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Guardar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;

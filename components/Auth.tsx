
import React, { useState } from 'react';
import { CreditCardIcon } from './Icons';

interface AuthProps {
    onLogin: (username: string, password: string) => boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Usuario y contraseña son requeridos.');
            return;
        }
        setError('');
        const success = onLogin(username, password);
        if (!success) {
            setError('Credenciales incorrectas. Verifique e intente de nuevo.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary-800 tracking-tight flex items-center justify-center gap-3">
                       <CreditCardIcon className="h-10 w-10"/> Gestión de Bodega Pro
                    </h1>
                    <p className="text-slate-600 mt-2">Su punto de venta en la nube.</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Iniciar Sesión
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                placeholder="Ej: BodegaDonPepe o superuser"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                             <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                     <div className="mt-6 text-center text-xs text-gray-500">
                        <p>¿No tiene una cuenta? Contacte al administrador para registrar su bodega.</p>
                        <p className="mt-2">Superuser login: <strong>superuser</strong> / <strong>password</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

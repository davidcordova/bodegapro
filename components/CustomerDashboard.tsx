
import React, { useMemo, useState } from 'react';
import type { Customer, Transaction, Sale } from '../types';
import { UsersIcon } from './Icons';

interface CustomerDashboardProps {
    session: { type: 'customer', customer: Customer, tenantId: string };
    transactions: Transaction[];
    sales: Sale[];
    onLogout: () => void;
}

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);


const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ session, transactions, sales, onLogout }) => {
    const { customer, tenantId } = session;
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

    const customerTransactions = useMemo(() => {
        return transactions
            .filter(t => t.customerId === customer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [customer.id, transactions]);

    const handleToggleDetails = (saleId: string | null) => {
        if (!saleId) return;
        setExpandedSaleId(currentId => (currentId === saleId ? null : saleId));
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <header className="bg-primary-800 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                               <span className='flex items-center gap-2'><UsersIcon className="h-8 w-8"/> Portal de Cliente</span>
                            </h1>
                            <p className="text-xs text-primary-200">Bodega: {tenantId}</p>
                        </div>
                        <button onClick={onLogout} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Bienvenido, {customer.name}</h2>
                    <p className="text-gray-600">Este es el estado de su cuenta de crédito.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wider">Deuda Actual</h3>
                            <p className={`text-5xl font-bold mt-2 ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                S/ {customer.balance.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Transacciones</h3>
                            <div className="overflow-y-auto max-h-[60vh] pr-2">
                                <table className="min-w-full">
                                    <thead className="bg-slate-100 sticky top-0">
                                        <tr>
                                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Tipo</th>
                                            <th className="py-2 px-4 text-right text-sm font-semibold text-gray-600">Monto</th>
                                            <th className="w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {customerTransactions.length > 0 ? customerTransactions.map(t => {
                                            const saleDetails = t.type === 'purchase' ? sales.find(s => s.id === t.saleId) : null;
                                            const isExpanded = expandedSaleId === t.saleId;
                                            return (
                                                <React.Fragment key={t.id}>
                                                    <tr onClick={() => handleToggleDetails(t.saleId)} className={t.type === 'purchase' ? 'cursor-pointer hover:bg-slate-50' : ''}>
                                                        <td className="py-3 px-4 text-gray-700">{new Date(t.date).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4 text-gray-700 capitalize">{t.type === 'purchase' ? 'Compra' : 'Pago'}</td>
                                                        <td className={`py-3 px-4 text-right font-medium ${t.type === 'purchase' ? 'text-red-500' : 'text-green-600'}`}>
                                                            {t.type === 'purchase' ? '+' : ''}S/ {t.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {t.type === 'purchase' && <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                                                        </td>
                                                    </tr>
                                                    {isExpanded && saleDetails && (
                                                        <tr>
                                                            <td colSpan={4} className="p-0">
                                                                <div className="bg-primary-50 p-4">
                                                                    <h4 className="font-semibold text-primary-800 mb-2">Detalle de la Compra:</h4>
                                                                    <table className="min-w-full bg-white rounded">
                                                                        <thead className='bg-primary-100'>
                                                                            <tr>
                                                                                <th className="py-1 px-2 text-left text-xs font-medium text-primary-900">Producto</th>
                                                                                <th className="py-1 px-2 text-right text-xs font-medium text-primary-900">Cant.</th>
                                                                                <th className="py-1 px-2 text-right text-xs font-medium text-primary-900">P.U.</th>
                                                                                <th className="py-1 px-2 text-right text-xs font-medium text-primary-900">Subtotal</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {saleDetails.items.map(item => (
                                                                                <tr key={item.productId}>
                                                                                    <td className="py-1 px-2 text-sm">{item.productName}</td>
                                                                                    <td className="py-1 px-2 text-sm text-right">{item.quantity}</td>
                                                                                    <td className="py-1 px-2 text-sm text-right">S/ {item.priceAtSale.toFixed(2)}</td>
                                                                                    <td className="py-1 px-2 text-sm text-right">S/ {(item.priceAtSale * item.quantity).toFixed(2)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-8 text-gray-500">No hay transacciones todavía.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;


import React, { useState, useMemo } from 'react';
import type { Customer, Transaction } from '../types';
import { PlusIcon } from './Icons';
import AddCustomerModal from './AddCustomerModal';

interface CustomersProps {
    customers: Customer[];
    transactions: Transaction[];
    onAddCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => Customer | undefined;
    onAddPayment: (customerId: string, amount: number) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, transactions, onAddCustomer, onAddPayment }) => {
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'balance'>) => {
        onAddCustomer(customerData);
        setIsAddingCustomer(false);
    };
    
    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCustomer && paymentAmount) {
            const amount = parseFloat(paymentAmount);
            if (amount > 0) {
                onAddPayment(selectedCustomer.id, amount);
                setPaymentAmount('');
            }
        }
    };

    const customerTransactions = useMemo(() => {
        if (!selectedCustomer) return [];
        return transactions
            .filter(t => t.customerId === selectedCustomer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedCustomer, transactions]);
    
    const existingUsernames = useMemo(() => customers.map(c => c.username.toLowerCase()), [customers]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Clientes</h2>
                    <button onClick={() => setIsAddingCustomer(true)} className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700"><PlusIcon className="h-5 w-5"/></button>
                </div>

                {isAddingCustomer && (
                   <AddCustomerModal 
                        onSave={handleSaveCustomer} 
                        onCancel={() => setIsAddingCustomer(false)}
                        existingUsernames={existingUsernames}
                    />
                )}

                <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {customers.map(c => (
                        <li key={c.id}>
                            <button onClick={() => setSelectedCustomer(c)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedCustomer?.id === c.id ? 'bg-primary-100' : 'hover:bg-slate-100'}`}>
                                <p className="font-semibold">{c.name}</p>
                                <p className={`text-sm ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    Balance: S/ {c.balance.toFixed(2)}
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                {selectedCustomer ? (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedCustomer.name}</h3>
                        <p className={`text-2xl font-bold mb-4 ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            Balance Actual: S/ {selectedCustomer.balance.toFixed(2)}
                        </p>
                        
                        <form onSubmit={handleAddPayment} className="bg-white p-4 rounded-md shadow-sm mb-4">
                            <h4 className="font-semibold mb-2">Registrar Pago</h4>
                            <div className="flex gap-2">
                                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Monto del pago" min="0.01" step="0.01" className="flex-grow p-2 border rounded-md" required/>
                                <button type="submit" className="bg-primary-600 text-white px-4 rounded-md hover:bg-primary-700">Registrar</button>
                            </div>
                        </form>
                        
                        <h4 className="font-semibold mb-2 mt-4">Historial de Transacciones</h4>
                        <div className="overflow-x-auto max-h-[45vh]">
                            <table className="min-w-full bg-white border">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {customerTransactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="py-2 px-3 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="py-2 px-3 text-sm text-gray-600 capitalize">{t.type === 'purchase' ? 'Compra' : 'Pago'}</td>
                                            <td className={`py-2 px-3 text-sm text-right font-semibold ${t.type === 'purchase' ? 'text-red-500' : 'text-green-600'}`}>
                                                S/ {t.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Seleccione un cliente para ver sus detalles.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customers;

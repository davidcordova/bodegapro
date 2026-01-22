
import React, { useState } from 'react';
import type { Product, Customer, Sale, Transaction, TenantData, User } from '../types';
import { Tab } from '../types';
import Sales from './Sales';
import Inventory from './Inventory';
import Customers from './Customers';
import UserSettings from './UserSettings';
import { CashIcon, CreditCardIcon, UsersIcon, ArchiveIcon } from './Icons';

interface DashboardProps {
    session: { type: 'tenant', user: User; tenantId: string };
    userData: TenantData;
    onLogout: () => void;
    onAddSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onUpdateProduct: (product: Product) => void;
    onAddCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => Customer | undefined;
    onAddPayment: (customerId: string, amount: number) => void;
    onAddUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { session, userData, onLogout, onAddSale, onAddProduct, onUpdateProduct, onAddCustomer, onAddPayment, onAddUser } = props;
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Sales);

    const renderContent = () => {
        const { products, customers, transactions, users, maxUsers } = userData;
        switch (activeTab) {
            case Tab.Sales:
                return <Sales products={products} customers={customers} onAddSale={onAddSale} onAddCustomer={onAddCustomer} session={session} />;
            case Tab.Inventory:
                return <Inventory products={products} onAddProduct={onAddProduct} onUpdateProduct={onUpdateProduct} />;
            case Tab.Customers:
                return <Customers customers={customers} transactions={transactions} onAddCustomer={onAddCustomer} onAddPayment={onAddPayment}/>;
            case Tab.Users:
                if (session.user.role !== 'admin') return null;
                return <UserSettings users={users} maxUsers={maxUsers} onAddUser={onAddUser} />;
            default:
                return null;
        }
    };

    const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactElement }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ease-in-out
                ${activeTab === tab 
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'}`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <header className="bg-primary-800 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                               <span className='flex items-center gap-2'><CreditCardIcon className="h-8 w-8"/> {session.tenantId}</span>
                            </h1>
                            <p className="text-xs text-primary-200">Usuario: {session.user.username} ({session.user.role})</p>
                        </div>
                        <button onClick={onLogout} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="border-b border-gray-200 bg-slate-100 sticky top-0 z-10">
                    <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                        <TabButton tab={Tab.Sales} label="Ventas" icon={<CashIcon className="h-5 w-5"/>} />
                        <TabButton tab={Tab.Inventory} label="Inventario" icon={<ArchiveIcon className="h-5 w-5"/>} />
                        <TabButton tab={Tab.Customers} label="Clientes y Fiados" icon={<UsersIcon className="h-5 w-5"/>} />
                        {session.user.role === 'admin' && (
                           <TabButton tab={Tab.Users} label="Usuarios" icon={<UsersIcon className="h-5 w-5"/>} />
                        )}
                    </nav>
                </div>

                <div className="mt-4 bg-white p-4 sm:p-6 rounded-b-lg rounded-r-lg shadow-md">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;


import React, { useState, useCallback, useEffect } from 'react';
import type { Product, Customer, Sale, Transaction, TenantData, User } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SuperUserDashboard from './components/SuperUserDashboard';
import CustomerDashboard from './components/CustomerDashboard';

// --- Hardcoded Superuser Credentials ---
const SUPER_USER_CREDENTIALS = {
    username: 'superuser',
    password: 'password'
};

// --- Session Type Definition ---
type Session = 
    | { type: 'superuser'; user: { username: string; role: 'admin' } }
    | { type: 'tenant'; user: User; tenantId: string }
    | { type: 'customer'; customer: Customer; tenantId: string };


// Helper functions for localStorage
const getInitialData = (): Record<string, TenantData> => {
    const data = localStorage.getItem('bodegaSaaSData');
    if (!data) return {};
    const parsedData = JSON.parse(data);
    Object.values(parsedData).forEach((tenant: any) => {
        tenant.sales.forEach((sale: any) => sale.date = new Date(sale.date));
        tenant.transactions.forEach((tx: any) => tx.date = new Date(tx.date));
    });
    return parsedData;
};

const getInitialSession = (): Session | null => {
    const data = localStorage.getItem('session');
    return data ? JSON.parse(data) : null;
};


const App: React.FC = () => {
    const [allData, setAllData] = useState<Record<string, TenantData>>(getInitialData);
    const [session, setSession] = useState<Session | null>(getInitialSession);

    useEffect(() => {
        localStorage.setItem('bodegaSaaSData', JSON.stringify(allData));
    }, [allData]);

    useEffect(() => {
        if (session) {
            localStorage.setItem('session', JSON.stringify(session));
        } else {
            localStorage.removeItem('session');
        }
    }, [session]);

    const handleLogin = (username: string, password: string):boolean => {
        // 1. Check for Superuser
        if (username === SUPER_USER_CREDENTIALS.username && password === SUPER_USER_CREDENTIALS.password) {
            setSession({ type: 'superuser', user: { username: 'superuser', password: '', role: 'admin' } });
            return true;
        }

        // 2. Check for tenant user (admin/staff)
        for (const tenantId in allData) {
            const tenant = allData[tenantId];
            const foundUser = tenant.users.find(u => u.username === username && u.password === password);
            if (foundUser) {
                setSession({ type: 'tenant', user: foundUser, tenantId: tenantId });
                return true;
            }
        }

        // 3. Check for customer
        for (const tenantId in allData) {
            const tenant = allData[tenantId];
            const foundCustomer = tenant.customers.find(c => c.username === username && c.password === password);
            if (foundCustomer) {
                setSession({ type: 'customer', customer: foundCustomer, tenantId: tenantId });
                return true;
            }
        }

        return false;
    };

    const handleLogout = () => setSession(null);

    const updateTenantData = (tenantId: string, updater: (data: TenantData) => TenantData) => {
        if (!tenantId) return;
        setAllData(prev => ({ ...prev, [tenantId]: updater(prev[tenantId]) }));
    };

    // --- Superuser Actions ---
    const handleCreateTenant = (tenantId: string, adminUser: User, maxUsers: number) => {
        if (allData[tenantId]) {
            throw new Error("La bodega ya existe.");
        }
        const newTenantData: TenantData = {
            products: [], customers: [], sales: [], transactions: [],
            users: [adminUser],
            maxUsers: maxUsers
        };
        setAllData(prev => ({ ...prev, [tenantId]: newTenantData }));
    };

    // --- Tenant Admin/Staff Actions ---
    const tenantId = (session?.type === 'tenant') ? session.tenantId : null;
    
    const handleAddSale = useCallback((sale: Omit<Sale, 'id' | 'date'>) => {
        if (!tenantId) return;
        updateTenantData(tenantId, data => {
            const newSale: Sale = { ...sale, id: `s${Date.now()}`, date: new Date() };
            const newProducts = [...data.products];
            newSale.items.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    newProducts[productIndex].stock -= item.quantity;
                }
            });
            let newCustomers = data.customers;
            let newTransactions = data.transactions;
            if (newSale.paymentMethod === 'credit' && newSale.customerId) {
                const customerId = newSale.customerId;
                newCustomers = data.customers.map(c => c.id === customerId ? { ...c, balance: c.balance + newSale.total } : c);
                newTransactions = [...data.transactions, { id: `t${Date.now()}`, customerId, date: newSale.date, type: 'purchase', amount: newSale.total, saleId: newSale.id }];
            }
            return { ...data, sales: [newSale, ...data.sales], products: newProducts, customers: newCustomers, transactions: newTransactions };
        });
    }, [tenantId]);

    const handleAddProduct = useCallback((p: Omit<Product, 'id'>) => { tenantId && updateTenantData(tenantId, d => ({ ...d, products: [{ ...p, id: `p${Date.now()}`}, ...d.products] })) }, [tenantId]);
    const handleUpdateProduct = useCallback((p: Product) => { tenantId && updateTenantData(tenantId, d => ({...d, products: d.products.map(op => op.id === p.id ? p : op) })) }, [tenantId]);
    
    const handleAddCustomer = useCallback((c: Omit<Customer, 'id'| 'balance'>): Customer | undefined => {
        if (!tenantId) return undefined;
        const newCustomer: Customer = { ...c, id: `c${Date.now()}`, balance: 0 };
        updateTenantData(tenantId, d => ({ ...d, customers: [newCustomer, ...d.customers] }));
        return newCustomer;
    }, [tenantId]);
    
    const handleAddPayment = useCallback((customerId: string, amount: number) => {
        if (!tenantId) return;
        updateTenantData(tenantId, data => {
            const newCustomers = data.customers.map(c => c.id === customerId ? { ...c, balance: c.balance - amount } : c);
            const newTx: Transaction = { id: `t${Date.now()}`, customerId, date: new Date(), type: 'payment', amount: -amount, saleId: null };
            return { ...data, customers: newCustomers, transactions: [newTx, ...data.transactions] };
        });
    }, [tenantId]);

    const handleAddUser = useCallback((user: User) => { tenantId && updateTenantData(tenantId, d => ({ ...d, users: [...d.users, user] })) }, [tenantId]);

    if (!session) {
        return <Auth onLogin={handleLogin} />;
    }

    switch (session.type) {
        case 'superuser':
            return <SuperUserDashboard allTenants={allData} onCreateTenant={handleCreateTenant} onLogout={handleLogout} />;
        
        case 'tenant':
            const userData = allData[session.tenantId];
             if (!userData) {
                handleLogout(); // Data integrity issue
                return <Auth onLogin={handleLogin} />;
            }
            return <Dashboard 
                session={session}
                userData={userData}
                onLogout={handleLogout}
                onAddSale={handleAddSale}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onAddCustomer={handleAddCustomer}
                onAddPayment={handleAddPayment}
                onAddUser={handleAddUser}
            />;
        
        case 'customer':
            const tenantData = allData[session.tenantId];
            if (!tenantData) {
                handleLogout(); // Data integrity issue
                return <Auth onLogin={handleLogin} />;
            }
            return <CustomerDashboard session={session} transactions={tenantData.transactions} sales={tenantData.sales} onLogout={handleLogout} />;

        default:
            handleLogout();
            return <Auth onLogin={handleLogin} />;
    }
};

export default App;

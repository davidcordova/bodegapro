
export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string | null;
}

export interface Customer {
    id: string;
    name: string;
    username: string;
    password; string;
    balance: number; // Positive means debt, negative means credit in favor
}

export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    priceAtSale: number;
}

export interface Sale {
    id: string;
    date: Date;
    items: SaleItem[];
    total: number;
    paymentMethod: 'cash' | 'credit';
    customerId: string | null;
}

export interface Transaction {
    id: string;
    customerId: string;
    date: Date;
    type: 'purchase' | 'payment';
    amount: number;
    saleId: string | null;
}

export interface User {
    username: string;
    password: string; // In a real app, this should be hashed
    role: 'admin' | 'staff';
}

export enum Tab {
    Sales = 'ventas',
    Inventory = 'inventario',
    Customers = 'clientes',
    Users = 'usuarios'
}

export interface TenantData {
    products: Product[];
    customers: Customer[];
    sales: Sale[];
    transactions: Transaction[];
    users: User[];
    maxUsers: number;
}

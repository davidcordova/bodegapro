
import React, { useState, useMemo } from 'react';
import type { Product, Customer, Sale, SaleItem, User } from '../types';
import ReceiptModal from './ReceiptModal';
import AddCustomerModal from './AddCustomerModal';
import { PlusCircleIcon, MinusCircleIcon, TrashIcon, ShoppingCartIcon, XCircleIcon, PlusIcon } from './Icons';

interface SalesProps {
    products: Product[];
    customers: Customer[];
    onAddSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
    onAddCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => Customer | undefined;
    session: { type: 'tenant', user: User; tenantId: string };
}

const Sales: React.FC<SalesProps> = ({ products, customers, onAddSale, onAddCustomer, session }) => {
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);

     const categories = useMemo(() => {
        const allCategories = products.map(p => p.category);
        return ['Todos', ...Array.from(new Set(allCategories)).filter(Boolean).sort()];
    }, [products]);

    const existingUsernames = useMemo(() => customers.map(c => c.username.toLowerCase()), [customers]);

    const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'balance'>) => {
        const newCustomer = onAddCustomer(customerData);
        if (newCustomer) {
            setSelectedCustomerId(newCustomer.id);
        }
        setIsAddingCustomer(false);
    };

    const addToCart = (product: Product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.productId === product.id);
            if (product.stock <= (existingItem?.quantity || 0)) {
                alert('No hay suficiente stock.');
                return currentCart;
            }
            if (existingItem) {
                return currentCart.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...currentCart, { productId: product.id, productName: product.name, quantity: 1, priceAtSale: product.price }];
        });
    };
    
    const updateQuantity = (productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if(!product) return;

        if(newQuantity > product.stock){
            alert('No hay suficiente stock.');
            return;
        }

        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.productId !== productId));
        } else {
            setCart(cart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
        }
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.priceAtSale * item.quantity), 0);
    }, [cart]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return p.stock > 0 && matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, categoryFilter]);

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('El carrito está vacío.');
            return;
        }
        if (paymentMethod === 'credit' && !selectedCustomerId) {
            alert('Por favor, seleccione un cliente para la venta a crédito.');
            return;
        }
        const saleDetails: Omit<Sale, 'id' | 'date'> = {
            items: cart,
            total: cartTotal,
            paymentMethod,
            customerId: paymentMethod === 'credit' ? selectedCustomerId : null,
        };
        onAddSale(saleDetails);

        const finalSale: Sale = { ...saleDetails, id: 'temp', date: new Date() };
        setLastSale(finalSale);
        setShowReceipt(true);
        
        // Reset state
        setCart([]);
        setPaymentMethod('cash');
        setSelectedCustomerId('');
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Productos Disponibles</h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                        {filteredProducts.map(product => (
                            <button key={product.id} onClick={() => addToCart(product)} className="border border-gray-200 rounded-lg p-3 text-center hover:shadow-md hover:border-primary-500 transition-all duration-200 bg-white flex flex-col justify-between">
                                <img src={product.imageUrl || 'https://via.placeholder.com/80'} alt={product.name} className="h-20 w-full object-contain mb-2 rounded-md"/>
                                <div>
                                    <p className="font-semibold text-gray-700 text-sm">{product.name}</p>
                                    <p className="text-primary-600 font-bold">S/ {product.price.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-slate-50 p-4 rounded-lg shadow-inner">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><ShoppingCartIcon className="h-6 w-6"/> Carrito de Compras</h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">El carrito está vacío.</p>
                        ) : cart.map(item => (
                            <div key={item.productId} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm">
                               <div className='flex-grow'>
                                 <p className="font-semibold text-sm">{item.productName}</p>
                                 <p className="text-xs text-gray-500">S/ {item.priceAtSale.toFixed(2)}</p>
                               </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}><MinusCircleIcon className="h-5 w-5 text-red-500"/></button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}><PlusCircleIcon className="h-5 w-5 text-green-500"/></button>
                                </div>
                                <p className="font-bold w-20 text-right">S/ {(item.priceAtSale * item.quantity).toFixed(2)}</p>
                                <button onClick={() => updateQuantity(item.productId, 0)} className="ml-2"><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-600"/></button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-2xl font-bold mb-4">
                            <span>Total:</span>
                            <span className="text-primary-700">S/ {cartTotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'cash' | 'credit')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                                    <option value="cash">Contado</option>
                                    <option value="credit">Crédito (Fiado)</option>
                                </select>
                            </div>
                            {paymentMethod === 'credit' && (
                                <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                    <div className="flex items-center gap-2">
                                        <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                                            <option value="">Seleccione un cliente</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <button onClick={() => setIsAddingCustomer(true)} type="button" className="bg-green-100 text-green-800 p-2 rounded-md hover:bg-green-200"><PlusIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            )}
                             <button 
                                onClick={handleCheckout} 
                                disabled={cart.length === 0 || (paymentMethod === 'credit' && !selectedCustomerId)}
                                className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Completar Venta
                            </button>
                            <button 
                                onClick={() => setCart([])} 
                                disabled={cart.length === 0}
                                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                               <XCircleIcon className="h-5 w-5"/> Cancelar
                            </button>
                        </div>
                    </div>
                </div>
                {showReceipt && lastSale && (
                    <ReceiptModal 
                        sale={lastSale} 
                        customer={customers.find(c => c.id === lastSale.customerId)}
                        tenantId={session.tenantId}
                        onClose={() => setShowReceipt(false)} 
                    />
                )}
            </div>
             {isAddingCustomer && (
                <AddCustomerModal
                    onSave={handleSaveCustomer}
                    onCancel={() => setIsAddingCustomer(false)}
                    existingUsernames={existingUsernames}
                />
            )}
        </>
    );
};

export default Sales;

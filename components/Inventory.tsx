
import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { PlusIcon } from './Icons';

interface InventoryProps {
    products: Product[];
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onUpdateProduct: (product: Product) => void;
}

const ProductForm: React.FC<{ product?: Product; onSave: (product: any) => void; onCancel: () => void; existingCategories: string[] }> = ({ product, onSave, onCancel, existingCategories }) => {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || '');
    const [stock, setStock] = useState(product?.stock || '');
    const [category, setCategory] = useState(product?.category || '');
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...product,
            name,
            price: parseFloat(price as string),
            stock: parseInt(stock as string, 10),
            category,
            imageUrl
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <span className="inline-block h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                                {imageUrl ? 
                                    <img src={imageUrl} alt="Vista previa" className="h-full w-full object-cover" /> : 
                                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.993A1 1 0 001 19.503V7.497A1 1 0 000 6.003V4.003A1 1 0 001 3.003h1.381A1 1 0 003.414 3.003l.866.867 1.258-1.259A1 1 0 007.414 2.003h9.172a1 1 0 00.707-.293l1.258 1.259.866-.867A1 1 0 0021.619 3.003H23a1 1 0 001-.999V4.003a1 1 0 00-1 .999v1.999a1 1 0 00-1 1.498v12.005A1 1 0 0024 20.993zM2 19.503h20V7.497H2v12.006zM12 9.003a4 4 0 100 8 4 4 0 000-8z" /></svg>
                                }
                            </span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                        <input 
                            type="text" 
                            id="category" 
                            list="category-list"
                            value={category} 
                            onChange={e => setCategory(e.target.value)} 
                            required 
                            placeholder="Ej: Bebidas, Abarrotes" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" 
                        />
                        <datalist id="category-list">
                            {existingCategories.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio (S/)</label>
                            <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                            <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} required min="0" step="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = useMemo(() => {
        const allCategories = products.map(p => p.category);
        return ['Todos', ...Array.from(new Set(allCategories)).filter(Boolean).sort()];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, categoryFilter]);


    const handleSave = (product: Product | Omit<Product, 'id'>) => {
        if ('id' in product) {
            onUpdateProduct(product);
        } else {
            onAddProduct(product);
        }
        setIsFormOpen(false);
        setEditingProduct(undefined);
    };

    const openEditForm = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                <h2 className="text-xl font-bold text-gray-800">Gestión de Inventario</h2>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                     <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 border rounded-md">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button
                        onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2"
                    >
                        <PlusIcon className="h-5 w-5" /> Nuevo
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                             <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="py-2 px-4">
                                    <img src={product.imageUrl || 'https://via.placeholder.com/40'} alt={product.name} className="h-10 w-10 rounded-md object-cover"/>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-600">{product.category}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-700">S/ {product.price.toFixed(2)}</td>
                                <td className={`py-4 px-4 whitespace-nowrap font-semibold ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                    {product.stock}
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                    <button onClick={() => openEditForm(product)} className="text-primary-600 hover:text-primary-800 font-medium">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormOpen && <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setEditingProduct(undefined); }} existingCategories={categories.filter(c => c !== 'Todos')} />}
        </div>
    );
};

export default Inventory;

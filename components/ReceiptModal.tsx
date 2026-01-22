
import React, { useRef } from 'react';
import type { Sale, Customer } from '../types';
import { WhatsAppIcon } from './Icons';

interface ReceiptModalProps {
    sale: Sale;
    customer?: Customer;
    tenantId: string | null;
    onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, customer, tenantId, onClose }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = receiptRef.current?.innerHTML;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if(printWindow) {
            printWindow.document.write(`<html><head><title>Recibo</title>`);
            printWindow.document.write('<style>body { font-family: monospace; line-height: 1.4; } table { width: 100%; border-collapse: collapse; } th, td { padding: 4px 0; } .text-right { text-align: right; } .total { font-weight: bold; border-top: 1px dashed black; padding-top: 5px; margin-top: 5px;} .header { text-align: center; margin-bottom: 10px; } </style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent || '');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    const handleWhatsAppShare = () => {
        let message = `*Recibo de Compra - ${tenantId || 'BODEGA'}*\n\n`;
        message += `*Fecha:* ${new Date(sale.date).toLocaleString()}\n`;
        if (customer) {
            message += `*Cliente:* ${customer.name}\n`;
        }
        message += '--------------------------------------\n';
        message += '*Detalle de la compra:*\n';
        sale.items.forEach(item => {
            message += `- ${item.productName} (${item.quantity} x S/${item.priceAtSale.toFixed(2)}) = S/${(item.quantity * item.priceAtSale).toFixed(2)}\n`;
        });
        message += '--------------------------------------\n';
        message += `*TOTAL: S/${sale.total.toFixed(2)}*\n`;
        message += `*Método de Pago:* ${sale.paymentMethod === 'cash' ? 'Contado' : 'Crédito'}\n`;

        if (customer && sale.paymentMethod === 'credit') {
             message += '\n';
             message += `_Saldo Anterior: S/${(customer.balance - sale.total).toFixed(2)}_\n`;
             message += `*Saldo Nuevo: S/${customer.balance.toFixed(2)}*\n`;
        }
         message += '\n¡Gracias por su compra!';

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div ref={receiptRef} className="p-6 text-sm font-mono text-black">
                    <div className="text-center mb-4">
                        <h2 className="font-bold text-lg uppercase">{tenantId || 'BODEGA'}</h2>
                        <p>Gracias por su compra</p>
                    </div>
                    <p><strong>Fecha:</strong> {new Date(sale.date).toLocaleString()}</p>
                    {customer && <p><strong>Cliente:</strong> {customer.name}</p>}
                    <p><strong>Pago:</strong> {sale.paymentMethod === 'cash' ? 'Contado' : 'Crédito (Fiado)'}</p>
                    <hr className="my-2 border-dashed border-black" />
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th className="text-right">Cant.</th>
                                <th className="text-right">P.U.</th>
                                <th className="text-right">Subt.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map(item => (
                                <tr key={item.productId}>
                                    <td>{item.productName}</td>
                                    <td className="text-right">{item.quantity}</td>
                                    <td className="text-right">{item.priceAtSale.toFixed(2)}</td>
                                    <td className="text-right">{(item.priceAtSale * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end mt-3 pt-2 border-t border-dashed border-black">
                        <p className="font-bold text-lg">TOTAL: S/ {sale.total.toFixed(2)}</p>
                    </div>
                    {customer && sale.paymentMethod === 'credit' && (
                        <div className="text-right mt-2 text-xs">
                            <p>Saldo Anterior: S/ {(customer.balance - sale.total).toFixed(2)}</p>
                            <p><strong>Saldo Nuevo: S/ {customer.balance.toFixed(2)}</strong></p>
                        </div>
                    )}
                </div>
                 <div className="bg-gray-100 p-4 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">Cerrar</button>
                    <button onClick={handleWhatsAppShare} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        <WhatsAppIcon className="h-5 w-5"/>
                        Enviar
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Imprimir</button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;

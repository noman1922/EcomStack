import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import api from '../api/axios';
import './Receipt.css';

const ReceiptPOS = ({ receipt, onClose }) => {
    const componentRef = useRef();
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        const fetchQRUrl = async () => {
            try {
                const res = await api.get('/settings/receipt-qr');
                setQrUrl(res.data.url || '');
            } catch (err) {
                setQrUrl('');
            }
        };
        fetchQRUrl();
    }, []);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    const handleDownloadPDF = async () => {
        const element = componentRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 15, 10, imgWidth, imgHeight);
        pdf.save(`receipt-${receipt.receipt_number}.pdf`);
    };
    const change = (receipt.cash_received || 0) - receipt.total;
    return (
        <div className="receipt-modal">
            <div className="receipt-container">
                <div className="receipt-actions">
                    <button onClick={handlePrint} className="btn-print">🖨️ Print</button>
                    <button onClick={handleDownloadPDF} className="btn-download">📥 Download PDF</button>
                    <button onClick={onClose} className="btn-close">✕</button>
                </div>
                <div ref={componentRef} className="receipt-content pos-receipt">
                    <div className="receipt-header">
                        <h1>EcomStack</h1>
                        <p>{receipt.store_address || 'Store Address Here'}</p>
                        <p>Tel: +880 1234567890</p>
                    </div>
                    <div className="receipt-divider"></div>
                    <div className="receipt-info">
                        <p>Receipt: {receipt.receipt_number}</p>
                        <p>Date: {new Date(receipt.generated_at).toLocaleString()}</p>
                        <p>Customer: {receipt.customer_name || 'Walk-in Customer'}</p>
                    </div>
                    <div className="receipt-divider"></div>
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price * item.quantity}tk</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="receipt-divider"></div>
                    <div className="receipt-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>{receipt.subtotal}tk</span>
                        </div>
                        {receipt.discount > 0 && (
                            <div className="total-row">
                                <span>Discount</span>
                                <span>-{receipt.discount}tk</span>
                            </div>
                        )}
                    </div>
                    <div className="receipt-divider"></div>
                    <div className="receipt-final">
                        <div className="final-row">
                            <strong>TOTAL</strong>
                            <strong>{receipt.total}tk</strong>
                        </div>
                        {receipt.cash_received && (
                            <>
                                <div className="final-row">
                                    <span>CASH</span>
                                    <span>{receipt.cash_received}tk</span>
                                </div>
                                <div className="final-row">
                                    <span>CHANGE</span>
                                    <span>{change}tk</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="receipt-divider"></div>
                    <div className="receipt-footer">
                        <h2>THANK YOU!</h2>
                        {qrUrl && (
                            <div className="receipt-qr" style={{ marginTop: '20px', textAlign: 'center' }}>
                                <QRCode value={qrUrl} size={100} />
                                <p style={{ fontSize: '0.75em', marginTop: '8px', color: '#666' }}>Scan for more info</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ReceiptPOS;
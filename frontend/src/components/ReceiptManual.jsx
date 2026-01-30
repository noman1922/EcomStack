import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import './Receipt.css';

const ReceiptManual = ({ receipt, qrUrl: propQrUrl, onClose }) => {
    const componentRef = useRef();
    const [qrUrl, setQrUrl] = useState(propQrUrl || '');

    useEffect(() => {
        if (!propQrUrl) {
            const fetchQRUrl = async () => {
                try {
                    const res = await api.get('/settings/receipt-qr');
                    setQrUrl(res.data.url || '');
                } catch (err) {
                    setQrUrl('');
                }
            };
            fetchQRUrl();
        } else {
            setQrUrl(propQrUrl);
        }
    }, [propQrUrl]);

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
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 15, 10, imgWidth, imgHeight);
        pdf.save(`receipt-${receipt.receipt_number}.pdf`);
    };

    return (
        <div className="receipt-modal">
            <div className="receipt-container">
                <div className="receipt-actions">
                    <button onClick={handlePrint} className="btn-print">🖨️ Print</button>
                    <button onClick={handleDownloadPDF} className="btn-download">📥 Download PDF</button>
                    <button onClick={onClose} className="btn-close">✕</button>
                </div>

                <div ref={componentRef} className="receipt-content online-receipt">
                    <div className="receipt-header">
                        <h1>ECOMSTACK</h1>
                        <p>Manual Order Receipt</p>
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="receipt-info">
                        <p><strong>Tracking ID:</strong> {receipt.tracking_id}</p>
                        <p><strong>Receipt #:</strong> {receipt.receipt_number}</p>
                        <p><strong>Date:</strong> {new Date(receipt.generated_at).toLocaleString()}</p>
                        <p><strong>Source:</strong> Social Media / Phone Order</p>
                    </div>

                    <div className="customer-details">
                        <h3>Customer Details</h3>
                        <p><strong>Name:</strong> {receipt.customer_name}</p>
                        <p><strong>Phone:</strong> {receipt.customer_phone}</p>
                        <p><strong>Address:</strong> {receipt.customer_address}</p>
                    </div>

                    <div className="order-items">
                        <h3>Items</h3>
                        {receipt.items.map((item, idx) => (
                            <div key={idx} className="order-item">
                                <div>
                                    <strong>{item.name}</strong> x{item.quantity}
                                </div>
                                <div>{item.price * item.quantity}tk</div>
                            </div>
                        ))}
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="receipt-totals">
                        <div className="total-row">
                            <span>Product Total:</span>
                            <span>{receipt.subtotal}tk</span>
                        </div>
                        <div className="total-row">
                            <span>Delivery Charge:</span>
                            <span>{receipt.delivery_charge}tk</span>
                        </div>
                        <p className="delivery-note">(Courier expense - not revenue)</p>
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="receipt-final">
                        <div className="final-row">
                            <strong>TOTAL COLLECTED:</strong>
                            <strong>{receipt.total}tk</strong>
                        </div>
                        <div className="total-row">
                            <span>Payment: </span>
                            <span>Received Online</span>
                        </div>
                    </div>

                    <div className="receipt-divider"></div>

                    {qrUrl && (
                        <div className="receipt-qr" style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                            <QRCodeSVG value={qrUrl} size={100} />
                            <p style={{ fontSize: '0.75em', marginTop: '8px', color: '#666' }}>Scan for more info</p>
                        </div>
                    )}

                    <div className="receipt-footer">
                        <p style={{ fontStyle: 'italic', color: '#6b7280' }}>
                            Order processed manually by admin
                        </p>
                        <p>Thank you for your order!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptManual;

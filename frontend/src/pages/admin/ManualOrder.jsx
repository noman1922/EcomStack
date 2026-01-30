import { useState, useEffect } from 'react';
import api from '../../api/axios';
import ReceiptOnline from '../../components/ReceiptOnline';
import './ManualOrder.css';

const ManualOrder = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [currentReceipt, setCurrentReceipt] = useState(null);
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchQRUrl();
    }, []);

    const fetchQRUrl = async () => {
        try {
            const res = await api.get('/settings/receipt-qr');
            setQrUrl(res.data.url || '');
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Auto-calculate delivery based on address
    useEffect(() => {
        if (customerInfo.address) {
            const isDhaka = customerInfo.address.toLowerCase().includes('dhaka');
            setDeliveryCharge(isDhaka ? 80 : 120);
        }
    }, [customerInfo.address]);

    const addProduct = (product) => {
        const productId = product._id || product.id;
        const existing = selectedProducts.find(p => (p._id || p.id) === productId);

        if (existing) {
            setSelectedProducts(selectedProducts.map(p =>
                (p._id || p.id) === productId ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            setSelectedProducts(selectedProducts.filter(p => (p._id || p.id) !== productId));
        } else {
            setSelectedProducts(selectedProducts.map(p =>
                (p._id || p.id) === productId ? { ...p, quantity } : p
            ));
        }
    };

    const subtotal = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const total = subtotal + deliveryCharge;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create order
            const orderData = {
                items: selectedProducts.map(p => ({
                    product_id: p._id || p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity,
                    image: p.image
                })),
                subtotal,
                delivery_charge: deliveryCharge,
                total_amount: total,
                shipping_address: customerInfo,
                payment_method: 'offline',
                payment_status: 'received',
                order_status: 'pending',
                source: 'manual'
            };

            const orderRes = await api.post('/orders', orderData);

            // Generate receipt
            const receiptRes = await api.post('/receipts/manual', {
                items: selectedProducts.map(p => ({
                    product_id: p._id || p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity
                })),
                customer_name: customerInfo.name,
                customer_phone: customerInfo.phone,
                customer_address: customerInfo.address,
                delivery_charge: deliveryCharge,
                subtotal,
                total,
                tracking_id: orderRes.data.tracking_id
            });

            // Show receipt
            setCurrentReceipt(receiptRes.data);
            setShowReceipt(true);

            // Reset form
            setSelectedProducts([]);
            setCustomerInfo({ name: '', phone: '', address: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to create order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manual-order-container">
            {showReceipt && currentReceipt && (
                <ReceiptOnline
                    receipt={currentReceipt}
                    qrUrl={qrUrl}
                    onClose={() => {
                        setShowReceipt(false);
                        setCurrentReceipt(null);
                    }}
                />
            )}

            <h2>📝 Manual Order Entry</h2>
            <p className="subtitle">For phone/social media orders</p>

            <div className="manual-order-grid">
                {/* Left: Product Selection */}
                <div className="product-selection">
                    <h3>Select Products</h3>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <div className="product-list">
                        {filteredProducts.map(product => (
                            <div key={product._id || product.id} className="product-item">
                                <img src={product.image} alt={product.name} />
                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <p className="price">{product.price}tk</p>
                                </div>
                                <button onClick={() => addProduct(product)} className="btn-add">
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Order Form */}
                <div className="order-form-section">
                    <form onSubmit={handleSubmit}>
                        <h3>Customer Information</h3>
                        <input
                            type="text"
                            placeholder="Customer Name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Full Address (include city/area)"
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                            required
                            rows="3"
                        />

                        <h3>Selected Products</h3>
                        {selectedProducts.length === 0 ? (
                            <p className="empty-cart">No products selected</p>
                        ) : (
                            <div className="selected-products">
                                {selectedProducts.map(product => (
                                    <div key={product._id || product.id} className="selected-item">
                                        <span>{product.name}</span>
                                        <div className="quantity-controls">
                                            <button type="button" onClick={() => updateQuantity(product._id || product.id, product.quantity - 1)}>-</button>
                                            <span>{product.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(product._id || product.id, product.quantity + 1)}>+</button>
                                            <button
                                                type="button"
                                                className="btn-remove"
                                                onClick={() => updateQuantity(product._id || product.id, 0)}
                                                title="Remove product"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <span>{product.price * product.quantity}tk</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>{subtotal}tk</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Charge:</span>
                                <span>{deliveryCharge}tk</span>
                            </div>
                            <div className="delivery-info">
                                {customerInfo.address && (
                                    <small>
                                        {customerInfo.address.toLowerCase().includes('dhaka')
                                            ? '📍 Inside Dhaka (80tk)'
                                            : '🚚 Outside Dhaka (120tk)'}
                                    </small>
                                )}
                            </div>
                            <div className="summary-row total">
                                <strong>Total:</strong>
                                <strong>{total}tk</strong>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting || selectedProducts.length === 0}
                        >
                            {isSubmitting ? 'Creating Order...' : 'Create Order'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManualOrder;

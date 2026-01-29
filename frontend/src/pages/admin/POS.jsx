import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import ReceiptPOS from '../../components/ReceiptPOS';
import './POS.css';

const POS = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentReceipt, setCurrentReceipt] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    useEffect(() => {
        fetchProducts();
        fetchQRUrl();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchQRUrl = async () => {
        try {
            const res = await api.get('/settings/pos_qr_url');
            setQrUrl(res.data.value || window.location.origin);
        } catch (err) {
            setQrUrl(window.location.origin);
        }
    };

    const addToCart = (product) => {
        console.log('Adding to cart:', product);
        const productId = product._id || product.id;
        const existing = cart.find(p => (p._id || p.id) === productId);

        console.log('Existing product:', existing);
        console.log('Current cart:', cart);

        if (existing) {
            setCart(cart.map(p =>
                (p._id || p.id) === productId ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, quantity) => {
        console.log('Updating quantity for:', productId, 'to:', quantity);
        if (quantity <= 0) {
            setCart(cart.filter(p => (p._id || p.id) !== productId));
        } else {
            setCart(cart.map(p =>
                (p._id || p.id) === productId ? { ...p, quantity } : p
            ));
        }
    };

    const subtotal = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const total = subtotal - discount;

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        setIsProcessing(true);

        try {
            // Create order as delivered (POS sales are instant)
            const orderData = {
                items: cart.map(p => ({
                    product_id: p._id || p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity,
                    image: p.image
                })),
                subtotal,
                delivery_charge: 0,
                total_amount: total,
                shipping_address: {
                    name: customerName || 'Walk-in Customer',
                    phone: 'POS Sale',
                    address: 'In-store purchase'
                },
                payment_method: paymentMethod,
                payment_status: 'received',
                order_status: 'delivered',
                source: 'pos'
            };

            await api.post('/orders', orderData);

            // Generate POS receipt
            const receiptData = {
                items: cart.map(p => ({
                    product_id: p._id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity
                })),
                subtotal,
                discount,
                total,
                cash_received: null,
                customer_name: customerName || 'Walk-in Customer'
            };

            const receiptRes = await api.post('/receipts/pos', receiptData);

            // Show receipt
            setCurrentReceipt(receiptRes.data);
            setShowReceipt(true);

            // Reset cart
            setCart([]);
            setDiscount(0);
            setCustomerName('');
        } catch (err) {
            console.error(err);
            alert('Failed to complete sale');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pos-container">
            {showReceipt && currentReceipt && (
                <ReceiptPOS
                    receipt={currentReceipt}
                    onClose={() => {
                        setShowReceipt(false);
                        setCurrentReceipt(null);
                    }}
                />
            )}

            <div className="pos-grid">
                {/* Left: Products */}
                <div className="pos-products">
                    <h3>Products</h3>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pos-search"
                    />
                    <div className="pos-product-grid">
                        {filteredProducts.map(product => (
                            <div
                                key={product._id}
                                className="pos-product-card"
                                onClick={() => addToCart(product)}
                            >
                                <img src={product.image} alt={product.name} />
                                <h4>{product.name}</h4>
                                <p className="price">{product.price}tk</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Cart */}
                <div className="pos-cart">
                    <h3>Current Sale</h3>

                    <input
                        type="text"
                        placeholder="Customer Name (optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="customer-input"
                    />

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p className="empty-cart">No items in cart</p>
                        ) : (
                            cart.map(item => (
                                <div key={item._id} className="cart-item">
                                    <span className="item-name">{item.name}</span>
                                    <div className="item-controls">
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                                        <button
                                            className="btn-remove"
                                            onClick={() => updateQuantity(item._id, 0)}
                                            title="Remove item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <span className="item-total">{item.price * item.quantity}tk</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="discount-section">
                        <label>Discount:</label>
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            placeholder="0"
                        />
                        <span>tk</span>
                    </div>

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>{subtotal}tk</span>
                        </div>
                        {discount > 0 && (
                            <div className="summary-row discount">
                                <span>Discount:</span>
                                <span>-{discount}tk</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <strong>Total:</strong>
                            <strong>{total}tk</strong>
                        </div>
                    </div>

                    <div className="payment-method">
                        <label>Payment Method:</label>
                        <div className="payment-options">
                            <button
                                type="button"
                                className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('cash')}
                            >
                                💵 Cash
                            </button>
                            <button
                                type="button"
                                className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                💳 Card
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleCompleteSale}
                        className="btn-complete"
                        disabled={isProcessing || cart.length === 0}
                    >
                        {isProcessing ? 'Processing...' : 'Complete Sale'}
                    </button>

                    {qrUrl && (
                        <div className="qr-preview">
                            <small>Receipt QR Code Preview:</small>
                            <QRCode value={qrUrl} size={80} key={qrUrl} />
                            <p style={{ fontSize: '10px', marginTop: '5px', color: 'var(--text-muted)' }}>{qrUrl}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default POS;

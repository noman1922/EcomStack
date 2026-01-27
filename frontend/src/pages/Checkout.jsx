import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Although AuthGuard should handle this
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Checkout.css';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shipping, setShipping] = useState({
        name: user?.name || '',
        address: '',
        city: '',
        zip: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [processing, setProcessing] = useState(false);

    const totalAmount = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

    const handleChange = (e) => {
        setShipping({ ...shipping, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setProcessing(true);

        if (paymentMethod === 'stripe') {
            // Simulate Stripe Payment
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
            const orderData = {
                items: cart,
                total_amount: totalAmount,
                shipping_address: shipping,
                payment_method: paymentMethod
            };

            const res = await api.post('/orders', orderData);

            clearCart();
            alert(`Order Placed Successfully! Tracking ID: ${res.data.tracking_id}`);
            navigate('/'); // Ideally to /orders or /profile
        } catch (err) {
            console.error(err);
            alert('Failed to place order.');
        } finally {
            setProcessing(false);
        }
    };

    if (cart.length === 0) {
        return <div className="checkout-empty">Your cart is empty</div>;
    }

    return (
        <div className="checkout">
            <h2>Checkout</h2>

            <div className="checkout-container">
                <form className="checkout-form" onSubmit={handlePlaceOrder}>
                    <h3>Shipping Address</h3>
                    <input name="name" placeholder="Full Name" value={shipping.name} onChange={handleChange} required />
                    <input name="address" placeholder="Address" value={shipping.address} onChange={handleChange} required />
                    <div className="form-row">
                        <input name="city" placeholder="City" value={shipping.city} onChange={handleChange} required />
                        <input name="zip" placeholder="ZIP Code" value={shipping.zip} onChange={handleChange} required />
                    </div>
                    <input name="phone" placeholder="Phone Number" value={shipping.phone} onChange={handleChange} required />

                    <h3>Payment Method</h3>
                    <div className="payment-options">
                        <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                            />
                            Cash on Delivery
                        </label>
                        <label className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="stripe"
                                checked={paymentMethod === 'stripe'}
                                onChange={() => setPaymentMethod('stripe')}
                            />
                            Credit Card (Stripe)
                        </label>
                    </div>

                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <p>Total Items: {cart.length}</p>
                        <p className="total-price">Total Amount: ${totalAmount}</p>
                    </div>

                    <button type="submit" disabled={processing}>
                        {processing ? 'Processing...' : (paymentMethod === 'stripe' ? 'Pay & Place Order' : 'Place Order')}
                    </button>
                    {paymentMethod === 'stripe' && <p className="secure-notice">🔒 Secure Payment via Stripe (Simulated)</p>}
                </form>
            </div>
        </div>
    );
};

export default Checkout;

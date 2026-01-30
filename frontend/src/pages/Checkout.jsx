import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { loadStripe } from '@stripe/stripe-js';
import {
    CardElement,
    Elements,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import './Checkout.css';

const stripePromise = loadStripe('pk_test_51SktIaHcxp1nbkTaMDuICZY6xjXvKCbex0srG0XvTs7YSlfOyEz7FGEirUChVhBwghtYPV9m3ZpbjMLgX88km6ho00ezLtlbxc');

const StripePaymentForm = ({ amountToPay, subtotal, deliveryCharge, shipping, paymentMethod, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);

        try {
            // 1. Create PaymentIntent on the server
            const { data: { clientSecret } } = await api.post('/create-payment-intent', {
                amount: amountToPay,
                currency: 'bdt',
            });

            // 2. Confirm the payment with Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: shipping.name,
                        email: 'user@example.com',
                        phone: shipping.phone,
                        address: {
                            line1: shipping.address,
                            city: shipping.city,
                            // Zip is removed from required billing details for better UX in BD context
                        }
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess(result.paymentIntent.id);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
            <div className="card-element-container">
                <CardElement options={{
                    hidePostalCode: true,
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                        },
                        invalid: { color: '#9e2146' },
                    },
                }} />
            </div>
            {error && <div className="payment-error">{error}</div>}
            <div className="stripe-actions">
                <button type="button" className="cancel-btn" onClick={onCancel}>Back to Options</button>
                <button type="submit" className="pay-btn" disabled={!stripe || processing}>
                    {processing ? 'Processing...' : `Pay ${amountToPay.toFixed(0)}tk`}
                </button>
            </div>
            <p className="payment-note">
                {paymentMethod === 'cod'
                    ? '* You are paying the delivery charge upfront to confirm your order.'
                    : '* You are paying the full amount for your order.'}
            </p>
        </form>
    );
};

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user?.role === 'admin') {
            navigate('/admin');
        }
    }, [user, authLoading]);

    const [shipping, setShipping] = useState({
        name: user?.name || '',
        address: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [processing, setProcessing] = useState(false);
    const [showStripe, setShowStripe] = useState(false);

    // Automated Delivery Logic
    const isDhaka = shipping.address.toLowerCase().includes('dhaka');
    const deliveryZone = isDhaka ? 'dhaka' : 'outside';
    const deliveryCharge = isDhaka ? 80 : 120;

    const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    const totalAmount = subtotal + deliveryCharge;

    // Amount to pay depends on choice: COD only pays Delivery Charge, Online pays Full
    const amountToPay = paymentMethod === 'cod' ? deliveryCharge : totalAmount;

    const handleChange = (e) => {
        setShipping({ ...shipping, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (stripePaymentId = null) => {
        setProcessing(true);

        try {
            const orderData = {
                items: cart,
                subtotal: subtotal,
                delivery_charge: deliveryCharge,
                total_amount: totalAmount,
                shipping_address: { ...shipping, zone: deliveryZone },
                payment_method: paymentMethod,
                payment_id: stripePaymentId,
                payment_status: paymentMethod === 'cod' ? 'Delivery Fee Paid' : 'Paid',
                source: 'online'
            };

            const res = await api.post('/orders', orderData);

            clearCart();
            alert(`Order Placed Successfully! Tracking ID: ${res.data.tracking_id}`);
            navigate('/profile');
        } catch (err) {
            console.error(err);
            alert('Failed to place order.');
        } finally {
            setProcessing(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Now both methods require some payment upfront
        setShowStripe(true);
    };

    if (authLoading) return <div className="loading-state">Checking credentials...</div>;

    if (cart.length === 0) {
        return <div className="checkout-empty">Your cart is empty</div>;
    }

    return (
        <div className="checkout animate-fade">
            <h2>Checkout</h2>

            <div className="checkout-container">
                {!showStripe ? (
                    <form className="checkout-form" onSubmit={handleFormSubmit}>
                        <div className="form-section">
                            <h3>Shipping Address</h3>
                            <input name="name" placeholder="Full Name" value={shipping.name} onChange={handleChange} required />
                            <textarea name="address" placeholder="Full Address (include city/area)" value={shipping.address} onChange={handleChange} required rows="3"></textarea>
                            <input name="phone" placeholder="Phone Number" value={shipping.phone} onChange={handleChange} required />
                        </div>

                        <div className="form-section">
                            <h3>Delivery Information</h3>
                            <div className={`delivery-badge ${deliveryZone}`}>
                                {isDhaka ? (
                                    <span>📍 <strong>Inside Dhaka</strong> detected (80tk Fee)</span>
                                ) : (
                                    <span>🚚 <strong>Outside Dhaka</strong> detected (120tk Fee)</span>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Payment Options</h3>
                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                    Cash on Delivery (Pay delivery fee now)
                                </label>
                                <label className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
                                    <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                                    Online Payment (Pay full amount now)
                                </label>
                            </div>
                        </div>

                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row"><span>Subtotal</span><span>{subtotal.toFixed(0)}tk</span></div>
                            <div className="summary-row"><span>Delivery Charge</span><span>{deliveryCharge}tk</span></div>
                            <div className="summary-row total"><span>Total Amount</span><span>{totalAmount.toFixed(0)}tk</span></div>
                            <div className="summary-row highlight">
                                <span>Amount to Pay Now</span>
                                <strong>{amountToPay.toFixed(0)}tk</strong>
                            </div>
                        </div>

                        <button type="submit" className="place-order-btn" disabled={processing}>
                            Continue to Online Payment
                        </button>
                    </form>
                ) : (
                    <div className="stripe-section">
                        <h3>Secure Payment</h3>
                        <p className="payment-amount">
                            Paying <strong>{amountToPay.toFixed(0)}tk</strong> via Stripe.
                        </p>
                        <Elements stripe={stripePromise}>
                            <StripePaymentForm
                                amountToPay={amountToPay}
                                subtotal={subtotal}
                                deliveryCharge={deliveryCharge}
                                shipping={shipping}
                                paymentMethod={paymentMethod}
                                onSuccess={(id) => handlePlaceOrder(id)}
                                onCancel={() => setShowStripe(false)}
                            />
                        </Elements>
                        <p className="secure-notice">🔒 Your payment is encrypted and secure.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;

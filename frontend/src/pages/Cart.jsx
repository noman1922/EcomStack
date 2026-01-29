import './Cart.css';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Cart = () => {
    const { cart, removeFromCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user?.role === 'admin') {
            navigate('/admin');
        }
    }, [user, authLoading]);

    if (authLoading) return <div className="loading-state">Loading...</div>;

    if (!user) {
        return (
            <div className="cart-empty">
                <h2>Please log in to view your cart</h2>
                <Link to="/login">Go to Login</Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Your cart is empty</h2>
                <Link to="/products">Go shopping</Link>
            </div>
        );
    }

    return (
        <div className="cart">
            <h2>Your Cart</h2>

            {cart.map(item => {
                const productId = item._id || item.id;
                const quantity = item.quantity || 1;
                const itemTotal = (item.discount_price || item.price) * quantity;

                return (
                    <div key={productId} className="cart-item">
                        <img
                            src={item.image}
                            alt={item.name}
                            onClick={() => navigate(`/product/${productId}`)}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className="cart-info" onClick={() => navigate(`/product/${productId}`)} style={{ cursor: 'pointer' }}>
                            <h4>{item.name}</h4>
                            <p>
                                {item.discount_price ? (
                                    <>
                                        <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                                            {item.discount_price}tk
                                        </span>
                                        {' '}
                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9em' }}>
                                            {item.price}tk
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ fontWeight: 'bold' }}>{item.price}tk</span>
                                )}
                            </p>
                            <p style={{ fontSize: '0.9em', color: '#666' }}>Quantity: {quantity}</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Subtotal: {itemTotal}tk</p>
                        </div>
                        <button onClick={() => removeFromCart(productId)}>Remove</button>
                    </div>
                );
            })}

            <Link to="/checkout" className="checkout-btn">
                Proceed to Checkout
            </Link>
        </div>
    );
};

export default Cart;

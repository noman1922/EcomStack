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

            {cart.map(item => (
                <div key={item._id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="cart-info">
                        <h4>{item.name}</h4>
                        <p>{item.price}tk</p>
                    </div>
                    <button onClick={() => removeFromCart(item._id)}>Remove</button>
                </div>
            ))}

            <Link to="/checkout" className="checkout-btn">
                Proceed to Checkout
            </Link>
        </div>
    );
};

export default Cart;

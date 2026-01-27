import './Cart.css';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart } = useCart();

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
                        <p>${item.price}</p>
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

import "./Auth.css";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, executePendingAction } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const user = await login(email, password);

            // Execute pending action if exists
            const pendingAction = executePendingAction();
            if (pendingAction) {
                if (pendingAction.type === 'addToCart') {
                    addToCart({ ...pendingAction.product, quantity: pendingAction.quantity });
                    alert('Added to bag!');
                } else if (pendingAction.type === 'addToWishlist') {
                    await addToWishlist(pendingAction.product);
                    alert('Added to wishlist!');
                }
            }

            if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-page">
                <h2>LOGIN</h2>

                <div className="social-login">
                    <button className="social-button">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="social-icon" />
                        <span>Google</span>
                    </button>
                    <button className="social-button">
                        <img src="https://www.svgrepo.com/show/303125/apple-logo.svg" alt="Apple" className="social-icon" />
                        <span>Apple</span>
                    </button>
                </div>

                <div className="separator">
                    <span>or</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <p className="error">{error}</p>}

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Sign In</button>
                </form>

                <p className="toggle-link" onClick={() => navigate('/register')}>
                    New here? Create account
                </p>
            </div>
        </div>
    );
};

export default Login;

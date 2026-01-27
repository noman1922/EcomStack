import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ShoppingBag, Heart, MapPin } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${searchTerm}`);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">EcommercePro</Link>

            <div className="nav-links-left">
                {/* Optional left links if needed */}
            </div>

            <div className="search-container">
                <input
                    className="search"
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>

            <div className="nav-actions">
                <div className="nav-item">
                    <MapPin size={20} />
                    <span>Stores</span>
                </div>

                <div className="nav-item profile-container">
                    <User size={20} />
                    <span>Profile</span>

                    <div className="profile-dropdown">
                        <div className="dropdown-header">
                            <p>Welcome</p>
                            {user ? (
                                <div className="auth-status">
                                    <span className="username">{user.name}</span>
                                </div>
                            ) : (
                                <div className="auth-links">
                                    <Link to="/login" className="login-link">Sign in</Link>
                                    <span className="divider">/</span>
                                    <Link to="/register" className="register-link">Sign up</Link>
                                </div>
                            )}
                        </div>

                        <ul className="dropdown-menu">
                            <li><Link to="/orders">Track Order</Link></li>
                            <li><Link to="/corporate">Corporate Sales</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            {user && (
                                <li className="logout-item" onClick={logout}>
                                    Logout
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="nav-item">
                    <Heart size={20} />
                    <span>Wishlist</span>
                </div>

                <Link to="/cart" className="nav-item">
                    <ShoppingBag size={20} />
                    <span>Bag</span>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;

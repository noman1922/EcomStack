import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, ShoppingBag, Heart, MapPin, Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${searchTerm}`);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">EcomStack</Link>

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
                <div className="nav-item" onClick={toggleTheme} style={{ width: '40px', alignItems: 'center' }}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                </div>

                <div className="nav-item">
                    <MapPin size={20} />
                    <span>Stores</span>
                </div>

                <div
                    className={`nav-item profile-container ${isProfileOpen ? 'active' : ''}`}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    ref={dropdownRef}
                >
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
                            {user && user.role === 'admin' && (
                                <li className="admin-link"><Link to="/admin">Admin Dashboard</Link></li>
                            )}
                            {user && (
                                <li><Link to="/profile">View Profile</Link></li>
                            )}
                            <li><Link to="/orders">Track Order</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            {user && (
                                <li className="logout-item" onClick={(e) => {
                                    e.stopPropagation();
                                    logout();
                                }}>
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

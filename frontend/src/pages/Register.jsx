import "./Auth.css";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        if (password !== confirm) return setError('Passwords do not match');

        try {
            await register({ name, email, password });
            navigate('/');
        } catch {
            setError('Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-page">
                <h2>CREATE ACCOUNT</h2>

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
                        placeholder="Full Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                    />

                    <button type="submit">Create Account</button>
                </form>

                <p className="toggle-link" onClick={() => navigate('/login')}>
                    Already have an account? Sign In
                </p>
            </div>
        </div>
    );
};

export default Register;

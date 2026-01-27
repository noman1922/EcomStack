import "./Auth.css";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch {
            setError('Invalid credentials');
        }
    };

    return (

        <div className="auth-container">
            <form className="auth-page" onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>

                {error && <p className="error">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
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

                <p>
                    New here? <Link to="/register">Create account</Link>
                </p>

                <p className="toggle-link" onClick={() => navigate('/register')}>
                    Or create an account
                </p>
            </form>
        </div>
    );

};

export default Login;

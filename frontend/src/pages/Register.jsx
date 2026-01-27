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
        <div className="auth-page">
            <form className="auth-box" onSubmit={handleSubmit}>
                <h2>Create Account</h2>

                {error && <p className="error">{error}</p>}

                <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />

                <button>Create Account</button>

                <p>
                    Already have account? <Link to="/login">Sign in</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;

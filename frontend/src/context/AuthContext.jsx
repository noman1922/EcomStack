import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/user');
                setUser(res.data);
            } catch (err) {
                // Not authenticated
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        setUser(res.data.user);
        syncPendingCart();
        return res.data.user;
    };

    const register = async (data) => {
        const res = await api.post('/register', data);
        setUser(res.data.user);
        syncPendingCart();
        return res.data.user;
    };

    const syncPendingCart = () => {
        const pendingItem = sessionStorage.getItem('pendingCartItem');
        if (pendingItem) {
            // This will be handled by the CartContext which listens to user changes
            // or we can trigger a manual sync if needed.
            sessionStorage.removeItem('pendingCartItem');
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Logout failed', err);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

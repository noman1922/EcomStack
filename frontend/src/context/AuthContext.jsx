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
        return res.data.user;
    };

    const register = async (data) => {
        const res = await api.post('/register', data);
        setUser(res.data.user);
        return res.data.user;
    };

    const executePendingAction = () => {
        const pendingAction = sessionStorage.getItem('pendingAction');
        if (pendingAction) {
            try {
                const action = JSON.parse(pendingAction);
                sessionStorage.removeItem('pendingAction');
                return action; // Return to be handled by Login component
            } catch (err) {
                console.error('Failed to parse pending action', err);
            }
        }
        return null;
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
        <AuthContext.Provider value={{ user, login, register, logout, loading, executePendingAction }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/user');
                setUser(res.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []); // Run once on mount

    // Inactivity Timeout (1 Hour)
    useEffect(() => {
        let timeout;
        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (user) {
                    console.log("Session expired due to inactivity");
                    logout();
                }
            }, 3600000); // 1 hour in ms
        };

        if (user) {
            window.addEventListener('mousemove', resetTimer);
            window.addEventListener('keypress', resetTimer);
            window.addEventListener('click', resetTimer);
            resetTimer();
        }

        return () => {
            if (timeout) clearTimeout(timeout);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('click', resetTimer);
        };
    }, [user]); // Only reset when user login status changes

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (data) => {
        const res = await api.post('/register', data);
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

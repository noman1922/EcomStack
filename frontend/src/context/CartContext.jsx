import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (user) {
            syncPendingItem();
        } else {
            // Clear cart when user logs out
            setCart([]);
            localStorage.removeItem('cart');
        }
    }, [user]);

    const syncPendingItem = () => {
        const pending = sessionStorage.getItem('pendingCartItem');
        if (pending) {
            try {
                const product = JSON.parse(pending);
                addToCart(product);
                sessionStorage.removeItem('pendingCartItem');
            } catch (e) {
                console.error("Error parsing pending item", e);
            }
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const productId = product._id || product.id;
            const exists = prev.find(item => (item._id || item.id) === productId);
            if (exists) {
                return prev.map(item =>
                    (item._id || item.id) === productId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => (item._id !== id && item.id !== id)));
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

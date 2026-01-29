import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data);
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (product) => {
        if (!user) {
            return { success: false, requiresAuth: true };
        }

        try {
            await api.post('/wishlist', { product_id: product._id || product.id });
            await fetchWishlist(); // Refresh wishlist
            return { success: true };
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            return { success: false, message: err.response?.data?.message || 'Failed to add to wishlist' };
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;

        try {
            await api.delete(`/wishlist/${productId}`);
            await fetchWishlist(); // Refresh wishlist
        } catch (err) {
            console.error('Error removing from wishlist:', err);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => {
            const itemProductId = item.product?._id || item.product?.id;
            return itemProductId === productId;
        });
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            loading
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);

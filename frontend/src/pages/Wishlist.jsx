import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Cart.css'; // Reuse Cart.css for styling

const Wishlist = () => {
    const { wishlist, removeFromWishlist, loading } = useWishlist();
    const { addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    if (authLoading || loading) {
        return <div className="loading-state">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    const handleAddToCart = (product) => {
        addToCart(product);
        alert('Added to cart!');
    };

    if (wishlist.length === 0) {
        return (
            <div className="cart-empty">
                <Heart size={64} color="#ccc" />
                <h2>Your wishlist is empty</h2>
                <p>Add items you love to your wishlist!</p>
                <Link to="/">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="cart">
            <h2>
                <Heart size={28} style={{ marginRight: '10px' }} />
                My Wishlist ({wishlist.length} items)
            </h2>

            <div className="wishlist-grid">
                {wishlist.map(item => {
                    const product = item.product;
                    if (!product) return null;

                    const productId = product._id || product.id;

                    return (
                        <div key={item.id} className="cart-item">
                            <img
                                src={product.image || "https://via.placeholder.com/100"}
                                alt={product.name}
                                onClick={() => navigate(`/product/${productId}`)}
                                style={{ cursor: 'pointer' }}
                            />
                            <div className="cart-info">
                                <h4
                                    onClick={() => navigate(`/product/${productId}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {product.name}
                                </h4>
                                <p>
                                    {product.discount_price ? (
                                        <>
                                            <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                                                {product.discount_price}tk
                                            </span>
                                            {' '}
                                            <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                                {product.price}tk
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{ fontWeight: 'bold' }}>{product.price}tk</span>
                                    )}
                                </p>
                            </div>
                            <div className="cart-actions">
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    <ShoppingCart size={16} />
                                    Add to Cart
                                </button>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromWishlist(productId)}
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Wishlist;

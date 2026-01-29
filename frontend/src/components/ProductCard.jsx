import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
    const { user } = useAuth();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const productId = product._id || product.id;
    const inWishlist = isInWishlist(productId);

    const handleWishlistClick = async (e) => {
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        if (inWishlist) {
            await removeFromWishlist(productId);
        } else {
            const result = await addToWishlist(product);
            if (result.success) {
                // Optionally show success message
            }
        }
    };

    return (
        <div className="product-card">
            <div className="product-img">
                <img src={product.image || "https://via.placeholder.com/300x360"} alt={product.name} />
                {product.discount_price && (
                    <span className="discount">
                        {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                    </span>
                )}
                <button
                    className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                    onClick={handleWishlistClick}
                    aria-label="Add to wishlist"
                >
                    <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
            </div>

            <h3>{product.name}</h3>

            <div className="price">
                {product.discount_price ? (
                    <>
                        <span className="new">{product.discount_price}tk</span>
                        <span className="old">{product.price}tk</span>
                    </>
                ) : (
                    <span className="new">{product.price}tk</span>
                )}
            </div>

            <button
                className="add-cart"
                onClick={() => onAddToCart(product)}
            >
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;

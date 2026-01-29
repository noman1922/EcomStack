import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ShoppingCart,
    Star,
    MapPin,
    Truck,
    RefreshCcw,
    ShieldCheck,
    ChevronRight,
    ChevronDown,
    Minus,
    Plus,
    Share2,
    Heart
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './ProductPage.css';

const ProductPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [expandedSections, setExpandedSections] = useState({
        description: true,
        reviews: false,
        delivery: false
    });
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    const inWishlist = product ? isInWishlist(product._id || product.id) : false;

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch current product
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);

                // Fetch related products (same category)
                const allPRes = await api.get('/products');
                const related = allPRes.data
                    .filter(p => p.category === res.data.category && (p._id !== id && p.id !== id))
                    .slice(0, 4);
                setRelatedProducts(related);
            } catch (err) {
                console.error("Error fetching product details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
        window.scrollTo(0, 0);

        if (!authLoading && user?.role === 'admin') {
            navigate('/admin');
        }
    }, [id, user, authLoading, navigate]);

    // Separate effect for reviews to avoid infinite loop
    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            setReviewsLoading(true);
            try {
                const res = await api.get(`/products/${id}/reviews`);
                setReviews(res.data || []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [id]);

    const handleQuantityChange = (val) => {
        if (quantity + val >= 1) {
            setQuantity(quantity + val);
        }
    };

    const handleAdd = (itemToAdd = null) => {
        const productData = itemToAdd || product;
        if (!user) {
            sessionStorage.setItem('pendingAction', JSON.stringify({
                type: 'addToCart',
                product: productData,
                quantity: itemToAdd ? 1 : quantity
            }));
            navigate('/login');
            return;
        }
        if (productData) {
            addToCart({ ...productData, quantity: itemToAdd ? 1 : quantity });
            alert('Added to bag!');
        }
    };

    const handleWishlistClick = async () => {
        if (!user) {
            sessionStorage.setItem('pendingAction', JSON.stringify({
                type: 'addToWishlist',
                product: product
            }));
            navigate('/login');
            return;
        }

        if (inWishlist) {
            await removeFromWishlist(product._id || product.id);
        } else {
            await addToWishlist(product);
        }
    };

    const handleBuyNow = () => {
        if (!user) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify({ ...product, quantity }));
            navigate('/login');
            return;
        }
        // Add to cart and go directly to checkout
        addToCart({ ...product, quantity });
        navigate('/checkout');
    };

    if (loading) return <div className="product-loading">Loading item details...</div>;
    if (!product) return <div className="product-not-found">Product not found.</div>;

    return (
        <div className="product-page-wrapper">
            {/* BREADCRUMBS */}
            <div className="breadcrumbs">
                <Link to="/">Home</Link>
                <ChevronRight size={14} />
                <Link to={`/?category=${product.category}`}>{product.category}</Link>
                <ChevronRight size={14} />
                <span>{product.name}</span>
            </div>

            <div className="product-main-grid">
                {/* LEFT: IMAGE GALLERY */}
                <div className="product-gallery">
                    <div className="main-image-container">
                        <img src={product.image || "https://via.placeholder.com/600"} alt={product.name} />
                        <button className="gallery-action share"><Share2 size={20} /></button>
                        <button
                            className={`gallery-action wishlist ${inWishlist ? 'active' : ''}`}
                            onClick={handleWishlistClick}
                        >
                            <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                    {/* Placeholder Thumbnails */}
                    <div className="thumbnail-list">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`thumbnail ${i === 1 ? 'active' : ''}`}>
                                <img src={product.image || "https://via.placeholder.com/80"} alt="" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CENTER: PRODUCT INFO */}
                <div className="product-info-center">
                    <span className="info-category">{product.category}</span>
                    <h1 className="info-title">{product.name}</h1>

                    <div className="info-rating">
                        {reviews.length > 0 ? (
                            <>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            size={16}
                                            className={s <= Math.round(product.rating || 0) ? 'star-filled' : ''}
                                        />
                                    ))}
                                </div>
                                <span className="rating-count">({reviews.length} Review{reviews.length !== 1 ? 's' : ''})</span>
                            </>
                        ) : (
                            <span className="no-reviews">No reviews yet</span>
                        )}
                    </div>

                    <div className="info-price-section">
                        {product.discount_price ? (
                            <div className="price-box">
                                <span className="current-price">{product.discount_price}tk</span>
                                <span className="old-price">{product.price}tk</span>
                                <span className="discount-tag">-{Math.round(((product.price - product.discount_price) / product.price) * 100)}%</span>
                            </div>
                        ) : (
                            <span className="current-price">{product.price}tk</span>
                        )}
                    </div>

                    <div className="info-selectors">
                        <div className="selector-group">
                            <label>Quantity</label>
                            <div className="quantity-ctrl">
                                <button onClick={() => handleQuantityChange(-1)}><Minus size={16} /></button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)}><Plus size={16} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="info-actions">
                        <button className="buy-now-btn" onClick={handleBuyNow}>Buy Now</button>
                        <button className="add-cart-btn" onClick={() => handleAdd()}>
                            <ShoppingCart size={20} />
                            Add to Cart
                        </button>
                    </div>
                </div>

                {/* RIGHT: SIDEBAR (Delivery/Warranty) */}
                <aside className="product-sidebar">
                    <div className="sidebar-section">
                        <h4>Delivery Options <MapPin size={16} /></h4>
                        <div className="sidebar-item">
                            <div className="icon-wrap"><Truck size={20} /></div>
                            <div className="item-text">
                                <strong>Inside Dhaka</strong>
                                <span>1 - 2 days</span>
                            </div>
                            <span className="fee">80tk</span>
                        </div>
                        <div className="sidebar-item">
                            <div className="icon-wrap"><Truck size={20} /></div>
                            <div className="item-text">
                                <strong>Outside Dhaka</strong>
                                <span>2 - 4 days</span>
                            </div>
                            <span className="fee">120tk</span>
                        </div>
                        <div className="sidebar-item">
                            <div className="icon-wrap"><RefreshCcw size={20} /></div>
                            <div className="item-text">
                                <strong>Cash on Delivery Available</strong>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4>Service & Warranty</h4>
                        <div className="sidebar-item">
                            <div className="icon-wrap"><ShieldCheck size={20} /></div>
                            <div className="item-text">
                                <strong>100% Authentic</strong>
                                <span>Verified product quality</span>
                            </div>
                        </div>
                        <div className="sidebar-item">
                            <div className="icon-wrap"><RefreshCcw size={20} /></div>
                            <div className="item-text">
                                <strong>7 Days Return</strong>
                                <span>Change of mind is not applicable</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* LOWER CONTENT: DESCRIPTION / REVIEWS */}
            <div className="product-details-lower">
                <div className="tabs-header">
                    <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
                    <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</button>
                </div>

                <div className="tab-content">
                    {activeTab === 'description' ? (
                        <div className="description-content">
                            <h3>Product Specifications</h3>
                            <p>{product.description || "No specific description provided for this product. However, our premium selection ensures high quality and durability. Designed to meet modern standards of excellence."}</p>
                            <div className="spec-grid">
                                <div className="spec-item"><strong>Brand:</strong><span>Official Store</span></div>
                                <div className="spec-item"><strong>Category:</strong><span>{product.category}</span></div>
                                <div className="spec-item"><strong>SKU:</strong><span>{(product._id || product.id).substring(0, 10).toUpperCase()}</span></div>
                                <div className="spec-item"><strong>Condition:</strong><span>Brand New</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="reviews-content">
                            {reviewsLoading ? (
                                <p>Loading reviews...</p>
                            ) : reviews.length > 0 ? (
                                <>
                                    <div className="review-summary">
                                        <div className="big-rating">
                                            <strong>{product.rating || 'N/A'}</strong>
                                            <div className="stars">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star
                                                        key={s}
                                                        size={18}
                                                        className={s <= Math.round(product.rating || 0) ? 'star-filled' : ''}
                                                    />
                                                ))}
                                            </div>
                                            <span>Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <div className="reviews-list">
                                        {reviews.map(review => (
                                            <div key={review._id} className="review-item">
                                                <div className="review-header">
                                                    <div className="review-user">
                                                        <strong>{review.user?.name || 'Anonymous'}</strong>
                                                        {review.verified_purchase && (
                                                            <span className="verified-badge">✔ Verified Purchase</span>
                                                        )}
                                                    </div>
                                                    <div className="review-rating">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={14} className={s <= review.rating ? 'star-filled' : ''} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                                <span className="review-date">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="no-reviews-msg">No reviews yet. Be the first to review this product!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h2>You May Also Like</h2>
                    <div className="product-grid">
                        {relatedProducts.map(p => (
                            <div key={p._id || p.id} onClick={() => navigate(`/product/${p._id || p.id}`)}>
                                <ProductCard
                                    product={p}
                                    onAddToCart={(e) => {
                                        e?.stopPropagation();
                                        handleAdd(p);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProductPage;

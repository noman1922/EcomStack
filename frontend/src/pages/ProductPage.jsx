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
    Minus,
    Plus,
    Share2,
    Heart
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './ProductPage.css';

const ProductPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

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
    }, [id, user, authLoading]);

    const handleQuantityChange = (val) => {
        if (quantity + val >= 1) {
            setQuantity(quantity + val);
        }
    };

    const handleAdd = (itemToAdd = null) => {
        const productData = itemToAdd || product;
        if (!user) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify({ ...productData, quantity: itemToAdd ? 1 : quantity }));
            navigate('/login');
            return;
        }
        if (productData) {
            addToCart({ ...productData, quantity: itemToAdd ? 1 : quantity });
            alert('Added to bag!');
        }
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
                        <button className="gallery-action wishlist"><Heart size={20} /></button>
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
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="star-filled" />)}
                        </div>
                        <span className="rating-count">(4.8 • 156 Reviews)</span>
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
                        <button className="buy-now-btn" onClick={() => handleAdd()}>Buy Now</button>
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
                                <strong>Standard Delivery</strong>
                                <span>2 - 4 days</span>
                            </div>
                            <span className="fee">80tk</span>
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
                    <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews (156)</button>
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
                            <div className="review-summary">
                                <div className="big-rating">
                                    <strong>4.8</strong>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} className="star-filled" />)}
                                    </div>
                                    <span>Global Ratings</span>
                                </div>
                            </div>
                            <p className="no-reviews-msg">Top rated by customers this week!</p>
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

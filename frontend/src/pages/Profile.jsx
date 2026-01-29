import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star } from 'lucide-react';
import api from '../api/axios';
import ReceiptPOS from '../components/ReceiptPOS';
import ReceiptOnline from '../components/ReceiptOnline';
import ReceiptManual from '../components/ReceiptManual';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [pendingReviews, setPendingReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({});
    const [showReviewForm, setShowReviewForm] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await api.get('/orders');
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchPendingReviews = async () => {
            if (!user) return;
            try {
                const res = await api.get('/user/pending-reviews');
                setPendingReviews(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchReceipts = async () => {
            if (!user) return;
            try {
                const res = await api.get('/receipts');
                setReceipts(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchOrders();
        fetchPendingReviews();
        fetchReceipts();
    }, [user]);

    const handleSaveProfile = async () => {
        try {
            await api.put('/user/profile', formData);
            alert('Profile updated successfully!');
            setIsEditing(false);
            window.location.reload(); // Refresh to update context
        } catch (err) {
            alert('Failed to update profile');
            console.error(err);
        }
    };

    const handleSubmitReview = async (productId, orderId) => {
        const review = reviewForm[productId];
        if (!review || !review.rating || !review.comment) {
            alert('Please provide both rating and comment');
            return;
        }

        try {
            await api.post(`/products/${productId}/reviews`, {
                rating: review.rating,
                comment: review.comment,
                order_id: orderId
            });
            alert('Review submitted successfully!');
            setPendingReviews(prev => prev.filter(p => p.product._id !== productId));
            setShowReviewForm({ ...showReviewForm, [productId]: false });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        }
    };

    if (!user) return <div className="profile-container">Please log in.</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">{user.name.charAt(0)}</div>
                <div className="profile-info">
                    {isEditing ? (
                        <div className="profile-edit-form">
                            <input
                                placeholder="Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                placeholder="Email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <textarea
                                placeholder="Address"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                            />
                            <div className="profile-edit-actions">
                                <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                                <button className="cancel-btn-profile" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1>{user.name}</h1>
                            <p>{user.email}</p>
                            {user.phone && <p>Phone: {user.phone}</p>}
                            {user.address && <p>Address: {user.address}</p>}
                            <div>
                                <button className="edit-btn" onClick={() => { setIsEditing(true); setFormData({ name: user.name, email: user.email, phone: user.phone || '', address: user.address || '' }); }}>
                                    Edit Profile
                                </button>
                                <button onClick={logout} className="logout-btn">Logout</button>
                                {user.role === 'admin' && (
                                    <Link to="/admin">
                                        <button className="admin-btn">Admin Panel</button>
                                    </Link>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-content">
                {pendingReviews.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h2>Pending Reviews</h2>
                        <div className="pending-reviews-list">
                            {pendingReviews.map(({ product, order_id }) => (
                                <div key={product._id} className="pending-review-card">
                                    <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4>{product.name}</h4>
                                        {!showReviewForm[product._id] ? (
                                            <button onClick={() => setShowReviewForm({ ...showReviewForm, [product._id]: true })} className="btn-primary">
                                                Write Review
                                            </button>
                                        ) : (
                                            <div className="review-form">
                                                <div style={{ marginBottom: '10px' }}>
                                                    <label>Rating:</label>
                                                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star
                                                                key={star}
                                                                size={24}
                                                                onClick={() => setReviewForm({ ...reviewForm, [product._id]: { ...reviewForm[product._id], rating: star } })}
                                                                className={star <= (reviewForm[product._id]?.rating || 0) ? 'star-filled' : ''}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <textarea
                                                    placeholder="Share your experience with this product..."
                                                    value={reviewForm[product._id]?.comment || ''}
                                                    onChange={e => setReviewForm({ ...reviewForm, [product._id]: { ...reviewForm[product._id], comment: e.target.value } })}
                                                    rows={4}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                                />
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                    <button onClick={() => handleSubmitReview(product._id, order_id)} className="btn-primary">
                                                        Submit Review
                                                    </button>
                                                    <button onClick={() => setShowReviewForm({ ...showReviewForm, [product._id]: false })} className="cancel-btn">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h2>Order History</h2>
                {loading ? <p>Loading orders...</p> : (
                    orders.length > 0 ? (
                        <div className="order-list">
                            {orders.map(order => (
                                <div key={order._id || order.id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-id">#{order.tracking_id || (order._id || order.id).substring(0, 8)}</span>
                                        <span className={`order-status ${order.order_status || 'pending'}`}>{order.order_status || 'pending'}</span>
                                    </div>
                                    <div className="order-details">
                                        <p>Date: {new Date(order.created_at || order.createdAt).toLocaleDateString()}</p>
                                        <p>Total: {order.total_amount}tk</p>
                                        <p>Payment: {order.payment_method} ({order.payment_status || 'Completed'})</p>
                                        <Link to={`/orders?id=${order.tracking_id || (order._id || order.id)}`} className="trace-link">Trace Order</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No orders found.</p>
                    )
                )}
            </div>
        </div >
    );
};

export default Profile;

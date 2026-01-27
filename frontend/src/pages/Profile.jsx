import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
        fetchOrders();
    }, [user]);

    if (!user) return <div className="profile-container">Please log in.</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">{user.name.charAt(0)}</div>
                <div className="profile-info">
                    <h1>{user.name}</h1>
                    <p>{user.email}</p>
                    <button onClick={logout} className="logout-btn">Logout</button>
                    {user.role === 'admin' && <button className="admin-btn">Admin Panel</button>}
                </div>
            </div>

            <div className="profile-content">
                <h2>Order History</h2>
                {loading ? <p>Loading orders...</p> : (
                    orders.length > 0 ? (
                        <div className="order-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-id">#{order.tracking_id}</span>
                                        <span className={`order-status ${order.order_status}`}>{order.order_status}</span>
                                    </div>
                                    <div className="order-details">
                                        <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                        <p>Total: ${order.total_amount}</p>
                                        <p>Payment: {order.payment_method} ({order.payment_status})</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No orders found.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default Profile;

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import './OrderTracking.css';

const OrderTracking = () => {
    const [searchParams] = useSearchParams();
    const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (searchParams.get('id')) {
            handleTrack(searchParams.get('id'));
        }
    }, [searchParams]);

    const handleTrack = async (idToTrack) => {
        const id = idToTrack || trackingId;
        if (!id) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            // We search by tracking_id or Mongo ID
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
        } catch (err) {
            setError('Order not found. Please check your ID.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="status-icon delivered" />;
            case 'shipped': return <Truck className="status-icon shipped" />;
            case 'pending': return <Clock className="status-icon pending" />;
            default: return <Package className="status-icon" />;
        }
    };

    return (
        <div className="tracking-container animate-fade">
            <div className="tracking-card">
                <h2>Trace Order</h2>
                <p className="tracking-subtitle">Enter your Order ID or Tracking ID to see current status</p>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="e.g. 507f1f..."
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    />
                    <button onClick={() => handleTrack()}>
                        <Search size={20} />
                    </button>
                </div>

                {loading && <div className="tracking-loader">Searching...</div>}

                {error && <div className="tracking-error">{error}</div>}

                {order && (
                    <div className="order-result">
                        <div className="result-header">
                            <div className="status-block">
                                {getStatusIcon(order.order_status)}
                                <div className="status-text">
                                    <span className="label">Current Status</span>
                                    <strong className={`status-val ${order.order_status}`}>{order.order_status || 'Pending'}</strong>
                                </div>
                            </div>
                            <div className="id-block">
                                <span className="label">Tracking ID</span>
                                <strong>#{order.tracking_id || order._id.substring(0, 10)}</strong>
                            </div>
                        </div>

                        <div className="order-items-summary">
                            <h4>Items</h4>
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="tracking-item">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>{(item.price * item.quantity).toFixed(0)}tk</span>
                                </div>
                            ))}
                        </div>

                        <div className="tracking-footer">
                            <div className="total-row">
                                <span>Total Amount:</span>
                                <strong>{order.total_amount}tk</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Link to="/" className="back-home">Return to Shopping</Link>
        </div>
    );
};

export default OrderTracking;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapPin, Phone, Navigation } from 'lucide-react';
import './Stores.css';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await api.get('/settings/stores');
            setStores(response.data.value || []);
        } catch (err) {
            console.error('Error fetching stores:', err);
        } finally {
            setLoading(false);
        }
    };

    const openInMaps = (store) => {
        if (store.coordinates?.lat && store.coordinates?.lng) {
            window.open(`https://www.google.com/maps?q=${store.coordinates.lat},${store.coordinates.lng}`, '_blank');
        }
    };

    if (loading) return <div className="loading-state">Loading stores...</div>;

    if (stores.length === 0) {
        return (
            <div className="stores-empty">
                <MapPin size={64} color="#ccc" />
                <h2>No store locations available</h2>
                <p>Check back later for store locations near you!</p>
            </div>
        );
    }

    return (
        <div className="stores-page">
            <h1><MapPin size={32} /> Our Store Locations</h1>
            <p className="stores-subtitle">Visit us at any of our retail locations</p>

            <div className="stores-grid">
                {stores.map(store => (
                    <div key={store.id} className="store-location-card">
                        <div className="store-header">
                            <h3>{store.name}</h3>
                            <MapPin size={24} color="var(--primary)" />
                        </div>
                        <div className="store-details">
                            <p><strong>Address:</strong> {store.address}</p>
                            {store.city && <p><strong>City:</strong> {store.city}</p>}
                            {store.phone && (
                                <p>
                                    <Phone size={16} style={{ marginRight: '5px' }} />
                                    {store.phone}
                                </p>
                            )}
                        </div>
                        {store.coordinates?.lat && store.coordinates?.lng && (
                            <>
                                <div className="store-map">
                                    <iframe
                                        title={`Map of ${store.name}`}
                                        width="100%"
                                        height="200"
                                        frameBorder="0"
                                        style={{ border: 0, borderRadius: '8px' }}
                                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${store.coordinates.lat},${store.coordinates.lng}`}
                                        allowFullScreen
                                    />
                                </div>
                                <button className="directions-btn" onClick={() => openInMaps(store)}>
                                    <Navigation size={18} /> Get Directions
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stores;

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { MapPin, Plus, Trash2, Save } from 'lucide-react';
import './AdminSettings.css';

const StoreSettings = () => {
    const [stores, setStores] = useState([]);
    const [newStore, setNewStore] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
        coordinates: { lat: '', lng: '' }
    });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await api.get('/settings/stores');
            setStores(response.data.value || []);
        } catch (err) {
            console.error('Error fetching stores:', err);
        }
    };

    const handleAddStore = () => {
        if (newStore.name && newStore.address) {
            setStores([...stores, { ...newStore, id: Date.now() }]);
            setNewStore({ name: '', address: '', city: '', phone: '', coordinates: { lat: '', lng: '' } });
            setIsAdding(false);
        }
    };

    const handleRemoveStore = (id) => {
        setStores(stores.filter(s => s.id !== id));
    };

    const handleSave = async () => {
        try {
            await api.put('/settings/stores', { value: stores });
            alert('Store locations saved successfully!');
        } catch (err) {
            alert('Failed to save stores');
        }
    };

    return (
        <div className="settings-section">
            <div className="section-header">
                <h2><MapPin size={24} /> Store Locations</h2>
                <button className="btn-primary" onClick={() => setIsAdding(true)}>
                    <Plus size={18} /> Add Store
                </button>
            </div>

            {isAdding && (
                <div className="store-form-card">
                    <h3>Add New Store</h3>
                    <input
                        placeholder="Store Name"
                        value={newStore.name}
                        onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                    />
                    <input
                        placeholder="Address"
                        value={newStore.address}
                        onChange={e => setNewStore({ ...newStore, address: e.target.value })}
                    />
                    <input
                        placeholder="City"
                        value={newStore.city}
                        onChange={e => setNewStore({ ...newStore, city: e.target.value })}
                    />
                    <input
                        placeholder="Phone"
                        value={newStore.phone}
                        onChange={e => setNewStore({ ...newStore, phone: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Latitude"
                            value={newStore.coordinates.lat}
                            onChange={e => setNewStore({ ...newStore, coordinates: { ...newStore.coordinates, lat: e.target.value } })}
                        />
                        <input
                            placeholder="Longitude"
                            value={newStore.coordinates.lng}
                            onChange={e => setNewStore({ ...newStore, coordinates: { ...newStore.coordinates, lng: e.target.value } })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="btn-primary" onClick={handleAddStore}>Add</button>
                        <button onClick={() => setIsAdding(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="stores-list">
                {stores.map(store => (
                    <div key={store.id} className="store-card">
                        <div className="store-info">
                            <h4>{store.name}</h4>
                            <p>{store.address}</p>
                            <p>{store.city}</p>
                            <p>{store.phone}</p>
                            {store.coordinates.lat && (
                                <p style={{ fontSize: '0.85em', color: '#666' }}>
                                    Coordinates: {store.coordinates.lat}, {store.coordinates.lng}
                                </p>
                            )}
                        </div>
                        <button className="del" onClick={() => handleRemoveStore(store.id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button className="btn-save" onClick={handleSave}>
                <Save size={18} /> Save Store Locations
            </button>
        </div>
    );
};

export default StoreSettings;

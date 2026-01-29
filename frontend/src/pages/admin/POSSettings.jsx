import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './AdminSettings.css';

const POSSettings = () => {
    const [qrUrl, setQrUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchQRUrl();
    }, []);

    const fetchQRUrl = async () => {
        try {
            const res = await api.get('/settings/pos_qr_url');
            setQrUrl(res.data.value || '');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/settings/pos_qr_url', { value: qrUrl });
            alert('POS QR URL saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save QR URL');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="settings-section">
            <h3>POS Receipt QR Code</h3>
            <p className="subtitle">This QR code will appear on all POS receipts</p>

            <input
                type="url"
                placeholder="Enter URL (e.g., https://yourstore.com)"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                style={{ marginBottom: '15px' }}
            />

            <button onClick={handleSave} disabled={isSaving} className="btn-save">
                {isSaving ? 'Saving...' : 'Save QR URL'}
            </button>
        </div>
    );
};

export default POSSettings;

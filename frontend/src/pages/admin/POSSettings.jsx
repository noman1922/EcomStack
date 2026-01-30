import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';
import './POSSettings.css';

const POSSettings = () => {
    const [qrUrl, setQrUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchQRUrl();
    }, []);

    const fetchQRUrl = async () => {
        try {
            const res = await api.get('/settings/receipt-qr');
            setQrUrl(res.data.url || '');
        } catch (err) {
            console.error('Failed to load QR URL:', err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.post('/settings/receipt-qr', { url: qrUrl });
            setMessage('✅ QR URL saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ Failed to save QR URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pos-settings-container">
            <div className="settings-header">
                <h2>📱 Receipt Settings</h2>
                <p>Configure QR code that appears on all receipts (POS, Manual, Online)</p>
            </div>

            <div className="settings-card">
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Receipt QR Code URL</label>
                        <p className="help-text">This QR code will appear on all receipts</p>
                        <input
                            type="url"
                            placeholder="https://yourstore.com"
                            value={qrUrl}
                            onChange={(e) => setQrUrl(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-save" disabled={loading}>
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save QR URL'}
                    </button>

                    {message && <p className="message">{message}</p>}
                </form>

                {qrUrl && (
                    <div className="qr-preview">
                        <h3>Receipt QR Code Preview</h3>
                        <div className="qr-box">
                            <QRCodeSVG value={qrUrl} size={150} />
                        </div>
                        <p className="preview-note">This QR code will appear on all receipts</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POSSettings;

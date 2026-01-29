import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FileText, Save } from 'lucide-react';
import './AdminSettings.css';

const FooterSettings = () => {
    const [footerData, setFooterData] = useState({
        aboutText: 'Premium fashion brand delivering worldwide.',
        customerCare: [
            { label: 'Contact Us', link: '/contact' },
            { label: 'Returns', link: '/returns' },
            { label: 'FAQs', link: '/faqs' }
        ],
        socialMedia: [
            { label: 'Facebook', link: 'https://facebook.com' },
            { label: 'Instagram', link: 'https://instagram.com' },
            { label: 'YouTube', link: 'https://youtube.com' }
        ],
        copyright: '© 2026 EcomStack. All rights reserved.'
    });

    useEffect(() => {
        fetchFooter();
    }, []);

    const fetchFooter = async () => {
        try {
            const response = await api.get('/settings/footer_content');
            if (response.data.value) {
                setFooterData(response.data.value);
            }
        } catch (err) {
            console.error('Error fetching footer:', err);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/settings/footer_content', { value: footerData });
            alert('Footer settings saved successfully!');
        } catch (err) {
            alert('Failed to save footer settings');
        }
    };

    const updateCustomerCare = (index, field, value) => {
        const updated = [...footerData.customerCare];
        updated[index][field] = value;
        setFooterData({ ...footerData, customerCare: updated });
    };

    const updateSocialMedia = (index, field, value) => {
        const updated = [...footerData.socialMedia];
        updated[index][field] = value;
        setFooterData({ ...footerData, socialMedia: updated });
    };

    return (
        <div className="settings-section">
            <div className="section-header">
                <h2><FileText size={24} /> Footer Settings</h2>
            </div>

            <div className="footer-settings-grid">
                <div className="settings-card">
                    <h3>About Section</h3>
                    <textarea
                        placeholder="About text"
                        value={footerData.aboutText}
                        onChange={e => setFooterData({ ...footerData, aboutText: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="settings-card">
                    <h3>Customer Care Links</h3>
                    {footerData.customerCare.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            <input
                                placeholder="Label"
                                value={item.label}
                                onChange={e => updateCustomerCare(idx, 'label', e.target.value)}
                                style={{ marginBottom: '5px' }}
                            />
                            <input
                                placeholder="Link"
                                value={item.link}
                                onChange={e => updateCustomerCare(idx, 'link', e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="settings-card">
                    <h3>Social Media Links</h3>
                    {footerData.socialMedia.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            <input
                                placeholder="Platform"
                                value={item.label}
                                onChange={e => updateSocialMedia(idx, 'label', e.target.value)}
                                style={{ marginBottom: '5px' }}
                            />
                            <input
                                placeholder="URL"
                                value={item.link}
                                onChange={e => updateSocialMedia(idx, 'link', e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="settings-card">
                    <h3>Copyright Text</h3>
                    <input
                        placeholder="Copyright text"
                        value={footerData.copyright}
                        onChange={e => setFooterData({ ...footerData, copyright: e.target.value })}
                    />
                </div>
            </div>

            <button className="btn-save" onClick={handleSave}>
                <Save size={18} /> Save Footer Settings
            </button>
        </div>
    );
};

export default FooterSettings;

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
            { type: 'facebook', label: 'Facebook', link: 'https://facebook.com' },
            { type: 'linkedin', label: 'LinkedIn', link: 'https://linkedin.com' },
            { type: 'github', label: 'GitHub', link: 'https://github.com' }
        ]
        ,
        copyright: '© 2026 EcomStack. All rights reserved.'
    });

    useEffect(() => {
        fetchFooter();
    }, []);

    const fetchFooter = async () => {
        try {
            const response = await api.get('/settings/footer_content');
            let val = response.data.value;

            if (val && typeof val === 'string') {
                try {
                    val = JSON.parse(val);
                } catch (e) {
                    val = null;
                }
            }

            if (val) {
                // Ensure arrays exist for map functions
                setFooterData({
                    ...val,
                    customerCare: Array.isArray(val.customerCare) ? val.customerCare : [],
                    socialMedia: Array.isArray(val.socialMedia) ? val.socialMedia : []
                });
            }
        } catch (err) {
            console.error('Error fetching footer:', err);
        }
    };

    const addSocialPlatform = () => {
        const updated = [...footerData.socialMedia, { label: 'New Platform', link: '' }];
        setFooterData({ ...footerData, socialMedia: updated });
    };

    const removeSocialPlatform = (index) => {
        const updated = footerData.socialMedia.filter((_, i) => i !== index);
        setFooterData({ ...footerData, socialMedia: updated });
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
                    {(footerData.customerCare || []).map((item, idx) => (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3>Social Media Links</h3>
                        <button className="btn-primary" onClick={addSocialPlatform} style={{ padding: '4px 10px', fontSize: '12px' }}>+ Add</button>
                    </div>
                    {(footerData.socialMedia || []).map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', position: 'relative' }}>
                            <input
                                placeholder="Platform Name (e.g. Facebook)"
                                value={item.type || item.label}
                                onChange={e => updateSocialMedia(idx, 'label', e.target.value)}
                                style={{ marginBottom: '5px' }}
                            />
                            <input
                                placeholder="Profile URL"
                                value={item.link}
                                onChange={e => updateSocialMedia(idx, 'link', e.target.value)}
                            />
                            <button
                                onClick={() => removeSocialPlatform(idx)}
                                style={{ position: 'absolute', right: '5px', top: '5px', padding: '2px 8px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
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

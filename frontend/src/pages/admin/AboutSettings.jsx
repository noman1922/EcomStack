import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './AboutSettings.css';

const AboutSettings = () => {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAboutContent();
    }, []);

    const fetchAboutContent = async () => {
        try {
            const res = await api.get('/settings/about_us');
            setContent(res.data.value || '');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/settings/about_us', { value: content });
            alert('About Us content saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="about-settings">
            <h3>About Us Page Content</h3>
            <p className="subtitle">This will be displayed on the About Us page</p>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your company, mission, values, team..."
                rows="15"
            />

            <button onClick={handleSave} disabled={isSaving} className="btn-save">
                {isSaving ? 'Saving...' : 'Save Content'}
            </button>
        </div>
    );
};

export default AboutSettings;

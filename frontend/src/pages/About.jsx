import { useState, useEffect } from 'react';
import api from '../api/axios';
import './About.css';

const About = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAboutContent();
    }, []);

    const fetchAboutContent = async () => {
        try {
            const res = await api.get('/settings/about_us');
            setContent(res.data.value || 'Content coming soon...');
        } catch (err) {
            setContent('Content coming soon...');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="about-page"><p>Loading...</p></div>;
    }

    return (
        <div className="about-page">
            <div className="about-container">
                <h1>About Us</h1>
                <div className="about-content">
                    {content.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;

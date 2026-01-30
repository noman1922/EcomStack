import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Github, Instagram, Youtube, Twitter } from 'lucide-react';

import api from '../api/axios';
import './Footer.css';

const Footer = () => {
    const [footerData, setFooterData] = useState({
        aboutText: 'Premium fashion brand delivering worldwide.',
        customerCare: [
            { label: 'Contact Us', link: '/contact' },
            { label: 'Returns', link: '/returns' },
            { label: 'FAQs', link: '/faqs' }
        ],
        socialMedia: [
            { label: 'Facebook', link: 'https://facebook.com' },
            { label: 'Linkedin', link: 'https://linkedin.com' },
            { label: 'Github', link: 'https://github.com' }
        ],
        copyright: '© 2026 Abdullah Al Noman Khan. All rights reserved.'
    });

    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const response = await api.get('/settings/footer_content');
                if (response.data.value) {
                    let val = response.data.value;
                    if (typeof val === 'string') {
                        val = JSON.parse(val);
                    }
                    if (val && typeof val === 'object') {
                        setFooterData(prev => ({ ...prev, ...val }));
                    }
                }
            } catch {
                console.log('Using default footer content');
            }
        };
        fetchFooter();
    }, []);

    const getIcon = (item) => {
        const type = (item.type || item.label || '').toLowerCase();

        if (type.includes('facebook')) return <Facebook size={18} />;
        if (type.includes('linkedin')) return <Linkedin size={18} />;
        if (type.includes('github')) return <Github size={18} />;
        if (type.includes('instagram')) return <Instagram size={18} />;
        if (type.includes('youtube')) return <Youtube size={18} />;
        if (type.includes('twitter') || type.includes('x')) return <Twitter size={18} />;

        return null;
    };


    return (
        <footer className="footer">
            <div className="footer-cols">

                <div>
                    <h4>About</h4>
                    <p>{footerData.aboutText}</p>
                </div>

                <div>
                    <h4>Customer Care</h4>
                    {footerData.customerCare.map((item, idx) => (
                        <p key={idx}>
                            <Link to={item.link}>{item.label}</Link>
                        </p>
                    ))}
                </div>

                <div>
                    <h4>Follow Us</h4>
                    {footerData.socialMedia.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                        >
                            {getIcon(item)}
                            <span>{item.label}</span>
                        </a>

                    ))}
                </div>

            </div>

            <div className="footer-bottom">
                {footerData.copyright}
            </div>
        </footer>
    );
};

export default Footer;

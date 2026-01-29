import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
            { label: 'Instagram', link: 'https://instagram.com' },
            { label: 'YouTube', link: 'https://youtube.com' }
        ],
        copyright: '© 2026 EcomStack. All rights reserved.'
    });

    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const response = await api.get('/settings/footer_content');
                if (response.data.value) {
                    setFooterData(response.data.value);
                }
            } catch (err) {
                console.log('Using default footer content');
            }
        };
        fetchFooter();
    }, []);

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
                        <p key={idx}>
                            <a href={item.link} target="_blank" rel="noopener noreferrer">{item.label}</a>
                        </p>
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

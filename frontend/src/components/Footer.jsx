import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-cols">

                <div>
                    <h4>About</h4>
                    <p>Premium fashion brand delivering worldwide.</p>
                </div>

                <div>
                    <h4>Customer Care</h4>
                    <p>Contact Us</p>
                    <p>Returns</p>
                    <p>FAQs</p>
                </div>

                <div>
                    <h4>Follow Us</h4>
                    <p>Facebook</p>
                    <p>Instagram</p>
                    <p>YouTube</p>
                </div>

            </div>

            <div className="footer-bottom">
                © 2026 EcommercePro. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?q=80&w=1600&auto=format&fit=crop",
            title: "Winter Collection",
            subtitle: "Premium comfort for the cold season."
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop",
            title: "New Arrivals",
            subtitle: "Discover the latest trends in fashion."
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
            title: "Exclusive Deals",
            subtitle: "Up to 50% off on selected items."
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="hero">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                >
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1>{slide.title}</h1>
                        <p>{slide.subtitle}</p>
                        <div className="hero-buttons">
                            <Link to="/products" className="btn-primary">Shop Now</Link>
                            <Link to="/deals" className="btn-secondary">View Deals</Link>
                        </div>
                    </div>
                </div>
            ))}

            <button className="slider-btn prev" onClick={prevSlide}>&#10094;</button>
            <button className="slider-btn next" onClick={nextSlide}>&#10095;</button>

            <div className="slider-dots">
                {slides.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    ></span>
                ))}
            </div>
        </section>
    );
};

export default Hero;

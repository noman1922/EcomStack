import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Image as ImageIcon, Plus, Trash2, Save } from 'lucide-react';
import './AdminSettings.css';

const HeroSettings = () => {
    const [heroImages, setHeroImages] = useState([]);
    const [newSlide, setNewSlide] = useState({ image: '', title: '', subtitle: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchHeroImages();
    }, []);

    const fetchHeroImages = async () => {
        try {
            const response = await api.get('/settings/hero_images');
            setHeroImages(response.data.value || []);
        } catch (err) {
            console.error('Error fetching hero images:', err);
        }
    };

    const handleAddSlide = () => {
        if (newSlide.image && newSlide.title) {
            setHeroImages([...heroImages, { ...newSlide, id: Date.now() }]);
            setNewSlide({ image: '', title: '', subtitle: '' });
            setIsAdding(false);
        }
    };

    const handleRemoveSlide = (id) => {
        setHeroImages(heroImages.filter(s => s.id !== id));
    };

    const handleSave = async () => {
        if (heroImages.length < 3) {
            alert('You must add at least 3 hero images before saving!');
            return;
        }
        try {
            await api.put('/settings/hero_images', { value: heroImages });
            alert('Hero images saved successfully!');
        } catch (err) {
            alert('Failed to save hero images');
        }
    };

    return (
        <div className="settings-section">
            <div className="section-header">
                <h2><ImageIcon size={24} /> Hero Section Images</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                        {heroImages.length} / 3+ images {heroImages.length < 3 && '⚠️'}
                    </span>
                    <button className="btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Add Slide
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="hero-form-card">
                    <h3>Add New Slide</h3>
                    <input
                        placeholder="Image URL"
                        value={newSlide.image}
                        onChange={e => setNewSlide({ ...newSlide, image: e.target.value })}
                    />
                    <input
                        placeholder="Title"
                        value={newSlide.title}
                        onChange={e => setNewSlide({ ...newSlide, title: e.target.value })}
                    />
                    <input
                        placeholder="Subtitle"
                        value={newSlide.subtitle}
                        onChange={e => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="btn-primary" onClick={handleAddSlide}>Add</button>
                        <button onClick={() => setIsAdding(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="hero-slides-grid">
                {heroImages.map(slide => (
                    <div key={slide.id} className="hero-slide-card">
                        <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div className="slide-info">
                            <h4>{slide.title}</h4>
                            <p>{slide.subtitle}</p>
                        </div>
                        <button className="del" onClick={() => handleRemoveSlide(slide.id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button className="btn-save" onClick={handleSave}>
                <Save size={18} /> Save Hero Images
            </button>
        </div>
    );
};

export default HeroSettings;

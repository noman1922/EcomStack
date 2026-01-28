import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Home.css';
import Hero from '../components/Hero';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchParams] = useSearchParams();
    const { addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, cRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);

                // Sort by newest by default
                const sorted = pRes.data.sort((a, b) => new Date(b.created_at || b._id) - new Date(a.created_at || a._id));
                setProducts(sorted);
                setCategories(cRes.data);
            } catch (err) {
                console.error("Error fetching home data:", err);
            }
        };
        fetchData();

        if (!authLoading && user?.role === 'admin') {
            navigate('/admin');
        }
    }, [user, authLoading]);

    const handleAddToCart = (product) => {
        if (!user) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify(product));
            navigate('/login');
            return;
        }
        addToCart(product);
    }

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    }

    if (authLoading) return <div className="loading-state">Loading...</div>;

    return (
        <div className="home">

            {/* HERO SECTION */}
            <Hero />

            <div className="container py-12">
                {/* CATEGORY TABS */}
                <CategoryTabs
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {/* PRODUCTS */}
                <section className="products">
                    <h2>{searchTerm ? `Search Results for "${searchTerm}"` : (selectedCategory === "All" ? "New Arrivals" : selectedCategory)}</h2>

                    <div className="product-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(p => (
                                <div key={p._id || p.id} onClick={() => handleProductClick(p._id || p.id)}>
                                    <ProductCard
                                        product={p}
                                        onAddToCart={(e) => {
                                            e?.stopPropagation(); // Prevent navigation when clicking add to cart
                                            handleAddToCart(p);
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                                No products found.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default Home;

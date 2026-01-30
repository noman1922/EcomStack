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
                const productsData = Array.isArray(pRes.data) ? pRes.data : [];
                const sorted = [...productsData].sort((a, b) => {
                    const dateB = new Date(b.created_at || b._id);
                    const dateA = new Date(a.created_at || a._id);
                    return (dateB.getTime() || 0) - (dateA.getTime() || 0);
                });
                setProducts(sorted);
                setCategories(Array.isArray(cRes.data) ? cRes.data : []);
            } catch (err) {
                console.error("Error fetching home data:", err);
            }
        };
        fetchData();

        if (!authLoading && user?.role === 'admin') {
            navigate('/admin');
        }
    }, [user, authLoading]);

    const handleAddToCart = (e, product) => {
        e?.stopPropagation();
        if (!user) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify(product));
            navigate('/login');
            return;
        }
        addToCart(product);
        alert('Added to bag!');
    }

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
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

                    <div className="product-grid animate-fade delay-300">
                        {filteredProducts.length === 0 ? (
                            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                                No products found.
                            </p>
                        ) : (
                            filteredProducts.map((p, index) => (
                                <div key={p._id || p.id} className={`animate-fade delay-${((index % 8) + 1) * 100}`} onClick={() => handleProductClick(p._id || p.id)}>
                                    <ProductCard
                                        product={p}
                                        onAddToCart={(e) => handleAddToCart(e, p)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default Home;
// TODO: Add loading state for products and categories
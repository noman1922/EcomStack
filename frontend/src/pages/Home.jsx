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
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchParams] = useSearchParams();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product) => {
        if (!user) {
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

    return (
        <div className="home">

            {/* HERO SECTION */}
            <Hero />

            {/* CATEGORY TABS */}
            <CategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* PRODUCTS */}
            <section className="products">
                <h2>{searchTerm ? `Search Results for "${searchTerm}"` : (selectedCategory === "All" ? "New Arrivals" : selectedCategory)}</h2>

                <div className="product-grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(p => (
                            <ProductCard
                                key={p._id}
                                product={p}
                                onAddToCart={handleAddToCart}
                            />
                        ))
                    ) : (
                        <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                            No products found.
                        </p>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;

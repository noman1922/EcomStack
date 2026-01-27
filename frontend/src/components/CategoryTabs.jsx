import './CategoryTabs.css';

const CategoryTabs = ({ selectedCategory, onSelectCategory }) => {
    const categories = [
        "All",
        "Men's Fashion",
        "Women's Fashion",
        "Electronics",
        "Accessories",
        "Home & Lifestyle"
    ];

    return (
        <div className="category-tabs">
            {categories.map((cat, index) => (
                <button
                    key={index}
                    className={selectedCategory === cat ? 'active' : ''}
                    onClick={() => onSelectCategory(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;

import './CategoryTabs.css';

const CategoryTabs = ({ categories, selectedCategory, onSelectCategory }) => {
    const allCategories = ["All", ...(Array.isArray(categories) ? categories.map(c => c.name) : [])];

    return (
        <div className="category-tabs animate-fade">
            {allCategories.map((cat, index) => (
                <button
                    key={index}
                    className={`${selectedCategory === cat ? 'active' : ''} delay-${(index % 5 + 1) * 100}`}
                    onClick={() => onSelectCategory(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;

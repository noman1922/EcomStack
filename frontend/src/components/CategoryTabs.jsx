import './CategoryTabs.css';

const CategoryTabs = ({ categories, selectedCategory, onSelectCategory }) => {
    const allCategories = ["All", ...categories.map(c => c.name)];

    return (
        <div className="category-tabs">
            {allCategories.map((cat, index) => (
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

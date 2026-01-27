import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="product-card">
            <div className="product-img">
                <img src={product.image || "https://via.placeholder.com/300x360"} alt={product.name} />
                {product.discount_price && (
                    <span className="discount">
                        {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                    </span>
                )}
            </div>

            <h3>{product.name}</h3>

            <div className="price">
                {product.discount_price ? (
                    <>
                        <span className="new">${product.discount_price}</span>
                        <span className="old">${product.price}</span>
                    </>
                ) : (
                    <span className="new">${product.price}</span>
                )}
            </div>

            <button
                className="add-cart"
                onClick={() => onAddToCart(product)}
            >
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;

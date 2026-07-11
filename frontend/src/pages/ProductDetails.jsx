import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to load product');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Loading product details...</h3>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="message error" style={{ marginTop: '2rem' }}>
          {error || 'Product not found'}
        </div>
        <Link to="/" style={{ textDecoration: 'underline' }}>Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" style={{ textDecoration: 'underline', fontSize: '0.9rem' }}>
        &larr; Back to Shop
      </Link>

      <div className="detail-layout">
        <div className="detail-image-container">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="detail-image" />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#999' }}>No Image</div>
          )}
        </div>

        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-price">${product.price.toFixed(2)}</div>
          
          <p className="detail-desc">{product.description}</p>

          <div className="detail-stock">
            Availability:{' '}
            {product.stock > 0 ? (
              <span className="stock-in">In Stock ({product.stock} available)</span>
            ) : (
              <span className="stock-out">Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <>
              <div className="qty-select-wrapper">
                <label htmlFor="qty" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Quantity</label>
                <select
                  id="qty"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{ width: '80px', padding: '0.4rem' }}
                >
                  {[...Array(Math.min(product.stock, 10)).keys()].map((n) => (
                    <option key={n + 1} value={n + 1}>
                      {n + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={handleAddToCart} style={{ alignSelf: 'flex-start', padding: '0.8rem 2.5rem' }}>
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

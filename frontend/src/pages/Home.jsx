import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { addToCart } = useCart();

  const categories = ['All', 'Accessories', 'Bags', 'Kitchen', 'Apparel', 'Bedroom'];

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/products';
      const params = [];
      if (category && category !== 'All') {
        params.push(`category=${encodeURIComponent(category)}`);
      }
      if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load products');
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run search filter fetching
    fetchProducts();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="container">
      <h2>Products</h2>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="filters-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button type="submit">Search</button>
        </div>
      </form>

      {loading ? (
        <div className="empty-state">
          <h3>Loading products...</h3>
        </div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try resetting your search or category filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/products/${product.id}`}>
                <div className="product-image-container">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="product-image" />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#999' }}>No Image</div>
                  )}
                </div>
              </Link>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <Link to={`/products/${product.id}`}>
                  <h3 className="product-title">{product.name}</h3>
                </Link>
                <div className="product-price">${product.price.toFixed(2)}</div>
                
                {product.stock > 0 ? (
                  <button onClick={() => addToCart(product, 1)} style={{ marginTop: 'auto' }}>
                    Add to Cart
                  </button>
                ) : (
                  <button disabled style={{ marginTop: 'auto' }}>
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!user) {
      // Redirect to login with a redirect back to checkout
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <h2>Your Cart</h2>
        <div className="empty-state">
          <h3>Your shopping cart is empty</h3>
          <p>Browse our collection to add items to your cart.</p>
          <Link to="/">
            <button>Start Shopping</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Your Cart</h2>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="cart-item-image" />
              ) : (
                <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#999' }}>No Image</div>
              )}

              <div className="cart-item-details">
                <div className="cart-item-row">
                  <Link to={`/products/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                </div>

                <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem', fontFamily: 'monospace' }}>
                  ${item.price.toFixed(2)} each
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity-val">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3 className="summary-title">Summary</h3>
          <div className="summary-row">
            <span>Items count</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ fontFamily: 'monospace' }}>FREE</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span style={{ fontFamily: 'monospace' }}>${getCartTotal().toFixed(2)}</span>
          </div>

          <button onClick={handleCheckoutClick} className="checkout-btn">
            {user ? 'Proceed to Checkout' : 'Login to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

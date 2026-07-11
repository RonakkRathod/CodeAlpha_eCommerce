import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login?redirect=checkout');
    }
    // Redirect if cart is empty and order wasn't just placed successfully
    if (cart.length === 0 && !orderSuccess) {
      navigate('/');
    }
  }, [user, cart, orderSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Shipping address is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping_address: shippingAddress,
          items: orderItems
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      setPlacedOrderId(data.orderId);
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message || 'Something went wrong while processing your order.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '4rem auto', border: '1px solid var(--border-dark)', padding: '3rem', textAlign: 'center' }}>
          <div className="message success" style={{ marginBottom: '1.5rem' }}>
            Order Placed Successfully!
          </div>
          <h2>Thank you for your purchase.</h2>
          <p style={{ margin: '1.5rem 0', fontSize: '0.95rem' }}>
            Your order number is <strong style={{ fontFamily: 'monospace' }}>#{placedOrderId}</strong>.
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            You will receive a shipment notification email once your order has been dispatched.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/orders">
              <button className="secondary">View My Orders</button>
            </Link>
            <Link to="/">
              <button>Continue Shopping</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Checkout</h2>

      <div className="cart-layout">
        <div>
          {error && <div className="message error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ border: '1px solid var(--border-dark)', padding: '2rem', backgroundColor: '#fafafa' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Shipping Address</h3>
            
            <div className="form-group">
              <label htmlFor="address">Full Delivery Address</label>
              <textarea
                id="address"
                rows="4"
                placeholder="Enter your full street address, city, state, postal code, and country..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                style={{ resize: 'vertical', width: '100%' }}
                required
              />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem' }}>
                {loading ? 'Processing Order...' : `Confirm and Pay $${getCartTotal().toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>

        <div className="cart-summary" style={{ border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
          <h3 className="summary-title" style={{ borderColor: 'var(--border-color)' }}>Order Summary</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ flexGrow: 1, paddingRight: '1rem' }}>
                  {item.name} <span style={{ color: '#666', fontFamily: 'monospace' }}>x{item.quantity}</span>
                </span>
                <span style={{ fontFamily: 'monospace' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span style={{ fontFamily: 'monospace' }}>${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ fontFamily: 'monospace' }}>FREE</span>
          </div>
          <div className="summary-row summary-total" style={{ borderTopColor: 'var(--border-color)' }}>
            <span>Total</span>
            <span style={{ fontFamily: 'monospace' }}>${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

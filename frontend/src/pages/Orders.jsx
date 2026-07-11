import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="container">
        <h2>Order History</h2>
        <div className="empty-state">
          <h3>Loading order history...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginBottom: '4rem' }}>
      <h2>Order History</h2>

      {error && <div className="message error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders placed yet</h3>
          <p>You haven't ordered anything from our catalog.</p>
          <Link to="/">
            <button style={{ marginTop: '1.5rem' }}>Browse Products</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-header-main">
                  <div>
                    Order ID: <span className="order-id">#{order.id}</span>
                  </div>
                  <div>
                    Date: <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  Status:{' '}
                  <span className={`order-status status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-items-list">
                {order.items && order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <div className="order-item-info">
                      <Link to={`/products/${item.product_id}`} className="order-item-name">
                        {item.product_name}
                      </Link>
                      <span className="order-item-qty">x{item.quantity}</span>
                    </div>
                    <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', marginTop: '1.5rem', paddingTop: '1rem' }}>
                <div className="order-address">
                  <strong>Shipped to:</strong> {order.shipping_address}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  Total: ${order.total_amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

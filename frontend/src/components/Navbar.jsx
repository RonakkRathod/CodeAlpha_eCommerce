import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <div className="container navbar">
        <Link to="/" className="logo">
          Minimalist
        </Link>
        <nav>
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/">Shop</Link>
            </li>
            <li className="nav-item">
              <Link to="/cart">
                Cart
                {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
              </Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link to="/orders">Orders</Link>
                </li>
                <li className="nav-item" style={{ fontFamily: 'monospace', textTransform: 'none', color: '#666' }}>
                  [{user.username}]
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: 'inherit', textDecoration: 'underline', padding: 0, textTransform: 'uppercase', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

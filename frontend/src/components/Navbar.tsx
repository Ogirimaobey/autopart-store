import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 mb-8" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div className="container flex justify-between items-center py-4">
        <Link to="/" className="flex items-center gap-sm">
          <Package size={28} color="var(--accent-primary)" />
          <span className="heading-2" style={{ letterSpacing: '-1px' }}>AutoPart<span className="text-accent">Store</span></span>
        </Link>

        <div className="flex items-center gap-lg">
          <Link to="/products" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
            Shop
          </Link>
          
          <Link to="/cart" className="relative" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && (
              <span 
                style={{ 
                  position: 'absolute', top: '-8px', right: '-12px', background: 'var(--accent-primary)', 
                  color: 'white', borderRadius: '50%', width: '20px', height: '20px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' 
                }}>
                {cartItemsCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-md">
              <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'VENDOR' ? '/vendor' : '/profile'} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                <UserIcon size={20} />
                <span style={{ fontWeight: 500 }}>{user.fullName}</span>
              </Link>
              <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-md">
              <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

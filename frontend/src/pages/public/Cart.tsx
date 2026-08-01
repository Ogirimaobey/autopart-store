import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-8 text-center" style={{ marginTop: '4rem' }}>
        <ShoppingBag size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 className="heading-2" style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Looks like you haven't added any auto parts yet.</p>
        <Link to="/products" className="btn btn-primary" style={{ textDecoration: 'none' }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="heading-1" style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
      
      <div className="grid gap-lg" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Cart Items */}
        <div className="flex-col gap-md">
          {cart.map((item: any) => (
            <div key={item.productId} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>Img</span>
              </div>
              
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.productId}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                </Link>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>₦{item.price.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-md">
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '80px', padding: '0.5rem' }}
                    value={item.quantity} 
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="glass-panel sticky top-0" style={{ padding: '2rem' }}>
            <h3 className="heading-3" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h3>
            
            <div className="flex justify-between" style={{ marginBottom: '1rem' }}>
              <span className="text-muted">Subtotal</span>
              <span style={{ fontWeight: 500 }}>₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '1.5rem' }}>
              <span className="text-muted">Shipping</span>
              <span style={{ fontWeight: 500 }}>Calculated at checkout</span>
            </div>
            
            <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span className="heading-2" style={{ color: 'var(--accent-primary)' }}>₦{total.toLocaleString()}</span>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

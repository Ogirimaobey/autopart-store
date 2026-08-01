import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth, type User } from '../../context/AuthContext';
import api from '../../services/api';
import { Loader } from '../../components/Loader';

export const Checkout: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Local state for address form
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'Nigeria'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else if (cart.length === 0) {
      navigate('/cart');
    }
  }, [user, cart, navigate]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.put('/users/profile', { address });
      updateUser(res.data.data as User);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user?.address?.street) {
      setError('Please save your delivery address first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 1. Create the order
      const orderRes = await api.post('/orders/checkout', {
        items: cart.map((item: any) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: user.address,
      });

      const orderId = orderRes.data.data._id;

      // 2. Initialize Paystack payment
      const paymentRes = await api.post(`/payments/init`, { orderId });
      
      // 3. Clear cart and redirect to Paystack
      clearCart();
      window.location.href = paymentRes.data.data.authorization_url;

    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="heading-1" style={{ marginBottom: '2rem' }}>Checkout</h1>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff8a8a', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div className="grid gap-lg" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        
        {/* Left Side: Address Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 className="heading-3" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Delivery Address</h3>
          
          <div className="input-group">
            <label>Street Address</label>
            <input name="street" className="input-field" value={address.street} onChange={handleAddressChange} />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="input-group">
              <label>City</label>
              <input name="city" className="input-field" value={address.city} onChange={handleAddressChange} />
            </div>
            <div className="input-group">
              <label>State</label>
              <input name="state" className="input-field" value={address.state} onChange={handleAddressChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="input-group">
              <label>Zip Code</label>
              <input name="zipCode" className="input-field" value={address.zipCode} onChange={handleAddressChange} />
            </div>
            <div className="input-group">
              <label>Country</label>
              <input name="country" className="input-field" value={address.country} onChange={handleAddressChange} disabled />
            </div>
          </div>
          
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', marginTop: '1rem' }} 
            onClick={handleSaveAddress}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Address to Profile'}
          </button>
        </div>

        {/* Right Side: Order Summary & Pay */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 className="heading-3" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Order Total</h3>
          
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <span className="text-muted">{cart.length} items</span>
            <span className="heading-2" style={{ color: 'var(--accent-primary)' }}>₦{total.toLocaleString()}</span>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }} 
            onClick={handlePayment}
            disabled={loading || !user.address?.street}
          >
            {loading ? 'Processing...' : 'Pay securely with Paystack'}
          </button>
          
          {!user.address?.street && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>
              You must save your delivery address before paying.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

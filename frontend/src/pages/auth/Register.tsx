import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'BUYER' // Default role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/register', formData);
      
      setSuccess('Registration successful! Please check your email for the OTP.');
      setTimeout(() => navigate('/verify-otp'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 flex justify-center items-center" style={{ minHeight: '70vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
        <h1 className="heading-2" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>Join the largest auto parts marketplace.</p>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff8a8a', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ padding: '0.75rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', color: '#4ade80', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name or Store Name</label>
            <input 
              name="fullName"
              type="text" 
              className="input-field" 
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              name="email"
              type="email" 
              className="input-field" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              name="password"
              type="password" 
              className="input-field" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label>I want to...</label>
            <select name="role" className="input-field" value={formData.role} onChange={handleChange}>
              <option value="BUYER">Buy Auto Parts</option>
              <option value="VENDOR">Sell Auto Parts (Requires Approval)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

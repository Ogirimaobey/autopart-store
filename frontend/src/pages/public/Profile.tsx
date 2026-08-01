import React, { useState } from 'react';
import { useAuth, type User } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import api from '../../services/api';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Nigeria'
    }
  });

  // Password State
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await api.put('/users/profile', profileData);
      updateUser(res.data.data as User);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.put('/users/change-password', passwordData);
      setPasswordData({ oldPassword: '', newPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2 className="heading-2">My Profile</h2>
      </div>

      {message.text && (
        <div style={{ 
          padding: '1rem', marginBottom: '2rem', borderRadius: 'var(--radius-md)',
          background: message.type === 'error' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(74, 222, 128, 0.1)',
          color: message.type === 'error' ? '#ff8a8a' : '#4ade80',
          border: `1px solid ${message.type === 'error' ? 'red' : '#4ade80'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          className="btn" 
          style={{ background: 'transparent', borderRadius: 0, borderBottom: activeTab === 'profile' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)', padding: '0.5rem 1rem' }}
          onClick={() => setActiveTab('profile')}
        >
          Profile Settings
        </button>
        <button 
          className="btn" 
          style={{ background: 'transparent', borderRadius: 0, borderBottom: activeTab === 'password' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'password' ? 'var(--text-primary)' : 'var(--text-secondary)', padding: '0.5rem 1rem' }}
          onClick={() => setActiveTab('password')}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} style={{ maxWidth: '600px' }}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              className="input-field" 
              value={profileData.fullName} 
              onChange={e => setProfileData({...profileData, fullName: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input className="input-field" value={user?.email || ''} disabled />
          </div>
          
          <h3 className="heading-3" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Delivery Address</h3>
          <div className="input-group">
            <label>Street</label>
            <input className="input-field" value={profileData.address.street} onChange={e => setProfileData({...profileData, address: {...profileData.address, street: e.target.value}})} />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="input-group">
              <label>City</label>
              <input className="input-field" value={profileData.address.city} onChange={e => setProfileData({...profileData, address: {...profileData.address, city: e.target.value}})} />
            </div>
            <div className="input-group">
              <label>State</label>
              <input className="input-field" value={profileData.address.state} onChange={e => setProfileData({...profileData, address: {...profileData.address, state: e.target.value}})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="input-group">
              <label>Zip Code</label>
              <input className="input-field" value={profileData.address.zipCode} onChange={e => setProfileData({...profileData, address: {...profileData.address, zipCode: e.target.value}})} />
            </div>
            <div className="input-group">
              <label>Country</label>
              <input className="input-field" value={profileData.address.country} disabled />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} style={{ maxWidth: '400px' }}>
          <div className="input-group">
            <label>Current Password</label>
            <input 
              type="password"
              className="input-field" 
              value={passwordData.oldPassword} 
              onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} 
              required
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password"
              className="input-field" 
              value={passwordData.newPassword} 
              onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      )}

    </DashboardLayout>
  );
};

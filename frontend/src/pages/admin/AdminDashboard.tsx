import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Loader } from '../../components/Loader';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  pendingVendors: number;
}

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/approve-vendor`);
      fetchData(); // refresh data
    } catch (error) {
      console.error('Failed to approve vendor', error);
      alert('Approval failed');
    }
  };

  const pendingVendors = users.filter(u => u.role === 'BUYER' && !u.isVerified); // Simplified check for mock purposes

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2 className="heading-2" style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-md" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 69, 0, 0.1)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Total Users</p>
            <h3 className="heading-3">{stats?.totalUsers || 0}</h3>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '50%', color: '#4ade80' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Total Orders</p>
            <h3 className="heading-3">{stats?.totalOrders || 0}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', color: '#eab308' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Pending Vendors</p>
            <h3 className="heading-3">{stats?.pendingVendors || 0}</h3>
          </div>
        </div>
      </div>

      {/* Vendor Approvals */}
      <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Pending Vendor Approvals</h3>
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '3rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingVendors.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No pending approvals.</td>
              </tr>
            ) : (
              pendingVendors.map(user => (
                <tr key={user._id} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{user.fullName}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleApproveVendor(user._id)}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </DashboardLayout>
  );
};

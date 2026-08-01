import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Loader } from '../../components/Loader';
import { Package, DollarSign } from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, walletRes] = await Promise.all([
        api.get('/vendor/products'),
        api.get('/vendor/wallet')
      ]);
      setProducts(productsRes.data.data);
      setWallet(walletRes.data.data);
    } catch (error) {
      console.error('Failed to fetch vendor data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2 className="heading-2" style={{ marginBottom: '2rem' }}>Vendor Dashboard</h2>

      <div className="grid grid-cols-2 gap-md" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 69, 0, 0.1)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '1rem' }}>Cleared Wallet Balance</p>
            <h3 className="heading-2" style={{ color: 'var(--text-primary)' }}>₦{wallet?.balance?.toLocaleString() || 0}</h3>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '50%', color: '#4ade80' }}>
            <Package size={32} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '1rem' }}>Active Listings</p>
            <h3 className="heading-2" style={{ color: 'var(--text-primary)' }}>{products.length}</h3>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <h3 className="heading-3">My Products</h3>
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Add Product</button>
      </div>
      
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem' }}>Part Name</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Condition</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>You have not listed any products yet.</td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p._id} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-primary)' }}>₦{p.price.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{p.stock}</td>
                  <td style={{ padding: '1rem' }}>{p.condition}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </DashboardLayout>
  );
};

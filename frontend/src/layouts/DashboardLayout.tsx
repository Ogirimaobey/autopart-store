import React from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, ShieldCheck, CreditCard, LayoutDashboard } from 'lucide-react';
import { Loader } from '../components/Loader';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const sidebarConfig: SidebarItem[] = [
  { name: 'My Profile', path: '/profile', icon: <User size={20} />, roles: ['BUYER', 'VENDOR', 'ADMIN'] },
  { name: 'My Orders', path: '/profile/orders', icon: <Package size={20} />, roles: ['BUYER'] },
  
  // Vendor Only
  { name: 'Vendor Dashboard', path: '/vendor', icon: <LayoutDashboard size={20} />, roles: ['VENDOR'] },
  { name: 'My Products', path: '/vendor/products', icon: <Package size={20} />, roles: ['VENDOR'] },
  { name: 'Sub-Orders', path: '/vendor/orders', icon: <Package size={20} />, roles: ['VENDOR'] },
  { name: 'Wallet', path: '/vendor/wallet', icon: <CreditCard size={20} />, roles: ['VENDOR'] },

  // Admin Only
  { name: 'Admin Dashboard', path: '/admin', icon: <ShieldCheck size={20} />, roles: ['ADMIN'] },
  { name: 'User Management', path: '/admin/users', icon: <User size={20} />, roles: ['ADMIN'] },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container py-8"><Loader /></div>;
  if (!user) return <Navigate to="/login?redirect=/admin" />;

  const visibleLinks = sidebarConfig.filter(link => link.roles.includes(user.role));

  return (
    <div className="container py-8 flex gap-lg" style={{ minHeight: '70vh' }}>
      
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: '250px', padding: '1.5rem 1rem', height: 'fit-content' }}>
        <h3 className="heading-3" style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>Dashboard</h3>
        <nav className="flex flex-col gap-sm">
          {visibleLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center gap-md ${isActive ? 'text-accent' : 'text-muted'}`
              }
              style={{
                padding: '0.75rem 1rem',
                textDecoration: 'none',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('text-accent')) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                 e.currentTarget.style.background = 'transparent';
              }}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
      
    </div>
  );
};

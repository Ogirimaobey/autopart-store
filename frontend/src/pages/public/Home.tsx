import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, ShieldCheck, Zap } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="container py-8" style={{ marginTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 60%)', zIndex: -1 }}></div>
          
          <h1 className="heading-1" style={{ marginBottom: '1.5rem' }}>
            Genuine Auto Parts, <br/> Delivered Fast.
          </h1>
          <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            The largest premium marketplace in Nigeria connecting you with verified vendors for all your automotive needs.
          </p>
          
          <div className="flex justify-center gap-md">
            <Link to="/products" className="btn btn-primary" style={{ textDecoration: 'none' }}>Shop Now</Link>
            <Link to="/register" className="btn btn-outline" style={{ textDecoration: 'none' }}>Become a Vendor</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-8" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <div className="grid grid-cols-3 gap-lg">
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={48} color="var(--accent-primary)" />
            </div>
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Verified Vendors</h3>
            <p className="text-muted">Every vendor undergoes strict KYC to ensure parts are 100% genuine.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Settings size={48} color="var(--accent-primary)" />
            </div>
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Secure Escrow</h3>
            <p className="text-muted">Your money is safe. We hold funds until you confirm delivery of your parts.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={48} color="var(--accent-primary)" />
            </div>
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Lightning Fast</h3>
            <p className="text-muted">Direct vendor-to-buyer logistics mean you get your car back on the road faster.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

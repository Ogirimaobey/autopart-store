import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', marginTop: 'auto', padding: '3rem 0' }}>
      <div className="container flex justify-between items-center">
        <div>
          <span className="heading-3" style={{ letterSpacing: '-1px' }}>AutoPart<span className="text-accent">Store</span></span>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>The premier marketplace for genuine automotive parts in Nigeria.</p>
        </div>
        <div className="text-muted text-sm">
          &copy; {new Date().getFullYear()} AutoPart Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

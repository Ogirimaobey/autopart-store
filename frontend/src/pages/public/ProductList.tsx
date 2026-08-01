import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/Loader';

interface Product {
  _id: string;
  name: string;
  price: number;
  condition: string;
  categoryId: { name: string };
  brandId: { name: string };
}

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="container py-8">
      <h1 className="heading-1" style={{ marginBottom: '2rem' }}>All Parts</h1>
      
      {products.length === 0 ? (
        <p className="text-muted text-center py-8">No products available at the moment.</p>
      ) : (
        <div className="grid grid-cols-4 gap-md">
          {products.map((product) => (
            <Link to={`/products/${product._id}`} key={product._id} style={{ textDecoration: 'none' }}>
              <div className="glass-panel" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }} 
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                
                <div style={{ height: '200px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Placeholder for image */}
                  <span className="text-muted">No Image</span>
                </div>
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {product.brandId?.name}
                  </span>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', flex: 1 }}>
                    {product.name}
                  </h3>
                  
                  <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
                      ₦{product.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                      {product.condition}
                    </span>
                  </div>
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

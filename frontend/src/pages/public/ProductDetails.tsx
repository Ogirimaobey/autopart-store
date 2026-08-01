import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Loader } from '../../components/Loader';
import { ShoppingCart } from 'lucide-react';

interface ProductDetails {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  condition: string;
  vendorId: { _id: string; storeName: string; fullName: string };
  categoryId: { name: string };
  brandId: { name: string };
}

export const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      vendorId: product.vendorId._id,
    });
    // Optional: show a toast or redirect
    navigate('/cart');
  };

  if (loading) return <Loader />;
  if (!product) return <div className="container py-8 text-center text-muted">Product not found.</div>;

  return (
    <div className="container py-8">
      <div className="glass-panel" style={{ display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Side: Image Placeholder */}
        <div style={{ flex: 1, background: 'var(--bg-tertiary)', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="text-muted" style={{ fontSize: '2rem' }}>Product Image</span>
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: 1, padding: '3rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {product.brandId?.name}
            </span>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
              {product.condition}
            </span>
          </div>

          <h1 className="heading-1" style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>{product.name}</h1>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>{product.description}</p>
          
          <div style={{ marginBottom: '2rem', padding: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sold by</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.vendorId?.storeName || product.vendorId?.fullName}</span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <span className="heading-1" style={{ color: 'var(--text-primary)' }}>₦{product.price.toLocaleString()}</span>
            <span style={{ display: 'block', color: product.stock > 0 ? '#4ade80' : 'var(--accent-primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ width: '100px', marginBottom: 0 }}>
              <input 
                type="number" 
                className="input-field" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                min="1"
                max={product.stock}
              />
            </div>
            
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, fontSize: '1.1rem' }} 
              onClick={handleAddToCart}
              disabled={product.stock < 1}
            >
              <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
              Add to Cart
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

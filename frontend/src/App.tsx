// import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Home } from './pages/public/Home';
import { ProductList } from './pages/public/ProductList';
import { ProductDetails } from './pages/public/ProductDetails';
import { Cart } from './pages/public/Cart';
import { Checkout } from './pages/public/Checkout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Profile } from './pages/public/Profile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { VendorDashboard } from './pages/vendor/VendorDashboard';

function App() {
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <main className="animate-fade-in" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/vendor" element={<VendorDashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;

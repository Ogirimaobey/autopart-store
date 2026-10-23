'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';

export const MobileNav = () => {
  const pathname = usePathname();
  const { totalItems } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const isSupplier = user?.role === 'supplier';

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/products', icon: Search },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      badge: totalItems > 0 ? totalItems : undefined,
    },
    { label: 'Enquiries', href: '/enquiries', icon: MessageSquare },
    {
      label: isSupplier ? 'Dashboard' : 'Account',
      href: isSupplier ? '/dashboard' : isAuthenticated ? '/orders' : '/login',
      icon: isSupplier ? LayoutDashboard : User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 text-neutral-600 py-1.5 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 relative py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-orange-600 font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

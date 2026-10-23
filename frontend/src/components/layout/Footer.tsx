import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Wrench, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white text-neutral-600 border-t border-neutral-200 mt-20">
      {/* Value Proposition Highlights */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-neutral-900 font-bold text-sm">Verified Suppliers</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Parts verified directly with Ladipo market merchants and certified auto importers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600 flex-shrink-0">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-neutral-900 font-bold text-sm">Engine Code Match</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Search by exact engine codes (2GR-FE, K24A, 1ZZ-FE) to prevent buying incorrect parts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-neutral-900 font-bold text-sm">Paystack Secured</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Bank-grade encrypted checkout with automated split settlements and receipts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-neutral-900 font-bold text-sm">Nationwide Delivery</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Doorstep shipping or pickup point available across all 36 Nigerian states.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand Info */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-neutral-900">
                AUTOPART<span className="text-orange-600">PRO</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-neutral-500 max-w-sm">
              Nigeria&apos;s leading automotive spare parts marketplace connecting car owners, mechanics, and fleet managers directly with verified spare parts merchants.
            </p>
            <div className="text-xs text-neutral-500 space-y-1.5 pt-2">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" /> Ladipo Auto Market & Port Warehouses, Lagos
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-600" /> +234 (0) 800-AUTOPARTS
              </p>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h5 className="text-neutral-900 font-bold text-sm mb-3">Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=engine-and-drivetrain" className="hover:text-orange-600">Engine & Drivetrain</Link></li>
              <li><Link href="/products?category=braking-system" className="hover:text-orange-600">Brake Rotors & Pads</Link></li>
              <li><Link href="/products?category=suspension-and-steering" className="hover:text-orange-600">Suspension & Steering</Link></li>
              <li><Link href="/products?category=electrical-and-lighting" className="hover:text-orange-600">Alternators & Starters</Link></li>
              <li><Link href="/products?category=air-conditioning-and-cooling" className="hover:text-orange-600">Radiators & AC Compressors</Link></li>
            </ul>
          </div>

          {/* Column 3: Vehicle Makes */}
          <div>
            <h5 className="text-neutral-900 font-bold text-sm mb-3">Vehicle Makes</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?vehicleBrand=Toyota" className="hover:text-orange-600">Toyota Genuine Parts</Link></li>
              <li><Link href="/products?vehicleBrand=Honda" className="hover:text-orange-600">Honda Genuine Parts</Link></li>
              <li><Link href="/products?vehicleBrand=Mercedes-Benz" className="hover:text-orange-600">Mercedes-Benz Parts</Link></li>
              <li><Link href="/products?vehicleBrand=Lexus" className="hover:text-orange-600">Lexus Replacement Parts</Link></li>
              <li><Link href="/products?vehicleBrand=Nissan" className="hover:text-orange-600">Nissan Genuine Parts</Link></li>
            </ul>
          </div>

          {/* Column 4: Supplier Partnership */}
          <div>
            <h5 className="text-neutral-900 font-bold text-sm mb-3">Sell on AutoPart</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/register" className="text-orange-600 font-bold hover:underline">Become a Verified Supplier</Link></li>
              <li><Link href="/dashboard" className="hover:text-orange-600">Supplier Dashboard</Link></li>
              <li><Link href="/enquiries" className="hover:text-orange-600">Customer Enquiries</Link></li>
              <li><Link href="/login" className="hover:text-orange-600">Supplier Sign In</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-neutral-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} AutoPartPro Marketplace Ltd. All rights reserved.</p>
          <div className="flex gap-4 mt-3 sm:mt-0">
            <span>Secure Payments by Paystack</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

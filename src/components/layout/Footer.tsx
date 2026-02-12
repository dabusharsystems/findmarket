import { Link } from 'react-router-dom';
import { Package, Wrench, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <span className="text-xl font-bold text-accent-foreground">F</span>
              </div>
              <span className="font-display text-xl font-bold">Findmarket</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              The marketplace where buyers post what they need and sellers compete to offer the best deals. Find products and services on your terms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/browse?type=product" className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/browse?type=service" className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-semibold mb-4">For Users</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/register" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Mail className="h-4 w-4" />
                support@findmarket.ke
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Phone className="h-4 w-4" />
                +254 700 000 000
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Findmarket. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/50 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/50 hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

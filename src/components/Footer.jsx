import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { MessageCircle, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';

export default function Footer({ onCategorySelect, onScrollToSection }) {
  const { setIsTrackingOpen, setIsAdminOpen } = useShop();
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer style={{ backgroundColor: '#121212', color: '#FDFBF7', paddingTop: '80px', paddingBottom: '40px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '60px'
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src="/assets/logo.png"
                alt="Ayaana's Skincare"
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'contain', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              />
              <div>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>
                  Ayaana’s
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#E2829F', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Pure Botanical Radiance
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#A89F95', lineHeight: 1.6, marginBottom: '20px' }}>
              Handcrafted halal luxury skincare. Powered by bio-active ceramides, pure organic rose hydrosols, and clinically proven botanical brighteners.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#D4CDC5' }}>
              <a
                href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25D366', textDecoration: 'none' }}
              >
                <MessageCircle style={{ width: '16px', height: '16px' }} />
                <span>{BRAND_CONFIG.whatsappDisplay} (WhatsApp Orders)</span>
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A89F95' }}>
                <MapPin style={{ width: '16px', height: '16px' }} />
                <span>Lahore & Nationwide Dispatch, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Col 2: The Collections */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '18px' }}>
              The Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#A89F95' }}>
              <li>
                <button
                  onClick={() => onCategorySelect('repair-creams')}
                  style={{ background: 'none', border: 'none', color: '#A89F95', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#A89F95'}
                >
                  Whitening & Repair Creams
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('toners')}
                  style={{ background: 'none', border: 'none', color: '#A89F95', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#A89F95'}
                >
                  Herbal Whitening Toners
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('serums')}
                  style={{ background: 'none', border: 'none', color: '#A89F95', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#A89F95'}
                >
                  24K Gold Glow Serums
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('hand-foot')}
                  style={{ background: 'none', border: 'none', color: '#A89F95', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#A89F95'}
                >
                  Hand & Foot Whitening Complex
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('cleansers')}
                  style={{ background: 'none', border: 'none', color: '#A89F95', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#A89F95'}
                >
                  Rose Cleansers & Masks
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Tracking */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '18px' }}>
              Customer Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#A89F95' }}>
              <li>
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#E2829F', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
                >
                  Track Your Order Online 🚚
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('before-after')}
                  style={{ background: 'none', border: 'none', color: '#A89F95', cursor: 'pointer', textAlign: 'left' }}
                >
                  Real Before & After Proof
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}?text=${encodeURIComponent("Hello! I have a question regarding delivery timelines and ordering.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#A89F95', textDecoration: 'none' }}
                >
                  Shipping & Delivery Info
                </a>
              </li>
              <li>
                <span style={{ color: '#A89F95' }}>Cash on Delivery (COD) Available</span>
              </li>
              <li>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#55514E', cursor: 'pointer', fontSize: '11px', textAlign: 'left', marginTop: '6px' }}
                >
                  Merchant & Inventory Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Exclusive Offers */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '12px' }}>
              VIP Radiance Club
            </h4>
            <p style={{ fontSize: '13px', color: '#A89F95', lineHeight: 1.5, marginBottom: '16px' }}>
              Subscribe to receive exclusive beauty secrets, early launch access, and an instant 10% discount code.
            </p>

            {isSubscribed ? (
              <div style={{ background: 'rgba(226, 130, 159, 0.15)', border: '1px solid #E2829F', padding: '14px', borderRadius: '12px', color: '#FCD8E3', fontSize: '12px' }}>
                🎉 Thank you for subscribing! Use coupon code <strong>GLOW10</strong> for 10% off your order!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '9999px',
                    padding: '12px 18px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#E2829F',
                    color: '#121212',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '12px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Claim 10% Voucher</span>
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Strip: Security & Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '12px',
            color: '#736C65'
          }}
        >
          <div>
            © {new Date().getFullYear()} <strong>Ayaana’s</strong>. All Rights Reserved. Crafted for Timeless Radiance.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: '#25D366' }} />
              100% Certified Authentic Botanicals
            </span>
            <span>•</span>
            <span>Pakistan Nationwide COD & Worldwide Courier</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

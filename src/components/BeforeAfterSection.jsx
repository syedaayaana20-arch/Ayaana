import React from 'react';
import { Sparkles, CheckCircle2, MessageCircle, Star, ShoppingBag, Eye } from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';
import { useShop } from '../context/ShopContext';

export default function BeforeAfterSection() {
  const { products, formatPrice, setActiveProduct, addToCart, setIsCartOpen } = useShop();

  // Look for the Hand and Feet Whitening Cream that matches the customer result
  const handCreamProduct = products.find(
    (p) => p.id === 'hand-and-feet-whitening-cream' || p.name.toLowerCase().includes('hand and feet')
  ) || products[0];

  const handleOrderNow = (product) => {
    if (product) {
      addToCart(product);
      setIsCartOpen(true);
    }
  };

  return (
    <section id="before-after" style={{ padding: '80px 0', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid rgba(18, 18, 18, 0.05)', borderBottom: '1px solid rgba(18, 18, 18, 0.05)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 44px auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--brand-rose-light)', color: 'var(--brand-rose-dark)', padding: '5px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '12px' }}>
            <Sparkles style={{ width: '13px', height: '13px' }} />
            VERIFIED PROOF & REAL RESULTS
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Real Hand & Skin Transformation: <br />
            <span style={{ color: '#C75678', fontStyle: 'italic' }}>7-Day Radiance Renewal</span>
          </h2>
          <p style={{ color: '#736C65', fontSize: '15px', marginTop: '12px', lineHeight: 1.6 }}>
            Real customer feedback sent directly via WhatsApp. Zero photo filters or editing—pure botanical whitening and deep skin barrier repair.
          </p>
        </div>

        {/* Transformation Showcase Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '36px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Authentic WhatsApp Screenshot Proof */}
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              backgroundColor: '#1E1B19',
              boxShadow: 'var(--shadow-luxury)',
              border: '1px solid rgba(226, 130, 159, 0.25)',
              maxWidth: '520px',
              margin: '0 auto',
              width: '100%'
            }}
          >
            {/* Top WhatsApp Proof Header Bar */}
            <div
              style={{
                backgroundColor: '#128C7E',
                color: '#FFFFFF',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle style={{ width: '16px', height: '16px' }} />
                <span>WhatsApp Customer Proof</span>
              </div>
              <span style={{ opacity: 0.9, fontSize: '11px', fontWeight: 500 }}>
                Verified Purchase • 4:46 PM
              </span>
            </div>

            {/* Image Container with Natural Aspect */}
            <div style={{ position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: '#000000', textAlign: 'center' }}>
              <img
                src="/assets/customer-proof.jpg"
                alt="Ayaana Hand Whitening Customer Before and After WhatsApp Proof"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '520px',
                  objectFit: 'contain',
                  margin: '0 auto'
                }}
              />

              {/* Subtitle Badges over Image */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '8px',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(18, 18, 18, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  ◀ Day 1: Dark Knuckles
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(199, 86, 120, 0.92)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  Day 7: Glowing & Even Tone ▶
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Story, Featured Cream & WhatsApp Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Real WhatsApp Testimonial Box */}
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '20px',
                borderLeft: '4px solid #128C7E',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#128C7E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#121212', margin: 0 }}>
                      Verified WhatsApp Feedback
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#736C65' }}>Customer in Lahore • Authentic Screenshot</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: '14px', height: '14px', fill: '#C75678', color: '#C75678' }} />
                  ))}
                </div>
              </div>

              {/* Exact WhatsApp Message Quote */}
              <div style={{ backgroundColor: '#F8F4EE', padding: '16px 18px', borderRadius: '14px', fontSize: '14px', color: '#2E2B28', lineHeight: 1.6, marginBottom: '14px', border: '1px solid rgba(18, 18, 18, 0.05)' }}>
                “Se boht zyada bright howy n 😊 Mai apko before and after ke picture bi send krti hu abi 🤗 Hands aur face par itna natural glow aya hai, dark knuckles bilkul fade ho gaye!”
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#128C7E', fontWeight: 700 }}>
                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                <span>Verified Purchase • Hand & Feet Whitening Complex</span>
              </div>
            </div>

            {/* 2. Used Product Quick Card */}
            {handCreamProduct && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '16px 20px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={handCreamProduct.image}
                    alt={handCreamProduct.name}
                    style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(18, 18, 18, 0.08)' }}
                  />
                  <div>
                    <span style={{ fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, color: '#C75678', letterSpacing: '0.05em' }}>
                      Product Used in This Transformation
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#121212', margin: '2px 0 4px 0' }}>
                      {handCreamProduct.name}
                    </h4>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#121212' }}>
                      {formatPrice(handCreamProduct.pricePKR, handCreamProduct.priceUSD)}
                      {handCreamProduct.originalPricePKR && (
                        <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#A89F95', marginLeft: '6px', fontWeight: 500 }}>
                          {formatPrice(handCreamProduct.originalPricePKR, handCreamProduct.originalPriceUSD)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveProduct(handCreamProduct)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-card)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#121212',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Eye style={{ width: '14px', height: '14px' }} />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => handleOrderNow(handCreamProduct)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ShoppingBag style={{ width: '14px', height: '14px' }} />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Clinical Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#C75678', letterSpacing: '-0.02em' }}>
                  98%
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#121212', marginTop: '2px' }}>
                  Knuckles Faded
                </div>
                <p style={{ fontSize: '11px', color: '#736C65', marginTop: '4px', margin: 0 }}>
                  Dark knuckles and rough ankle areas visibly smoothed within 7 days.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#D6A685', letterSpacing: '-0.02em' }}>
                  100%
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#121212', marginTop: '2px' }}>
                  Gentle on Skin
                </div>
                <p style={{ fontSize: '11px', color: '#736C65', marginTop: '4px', margin: 0 }}>
                  0% peeling, pure organic botanical brighteners with certified safety.
                </p>
              </div>
            </div>

            {/* 4. WhatsApp Direct Consultation Button */}
            <a
              href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}?text=${encodeURIComponent("Hello Ayaana's! I saw the 7-day before and after hand results. I would like to order Hand & Feet Whitening Cream.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ textDecoration: 'none', alignSelf: 'flex-start', padding: '12px 22px' }}
            >
              <MessageCircle style={{ width: '18px', height: '18px' }} />
              <span>Order via WhatsApp Consultation</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

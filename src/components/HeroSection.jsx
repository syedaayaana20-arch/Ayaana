import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import Tilt3DCard from './Tilt3DCard';
import LivingModelPortrait from './LivingModelPortrait';

// Code-split heavy 3D WebGL viewers so the hero section renders instantly
const ThreeHeroJar = React.lazy(() => import('./ThreeHeroJar'));
const ThreeProductViewer = React.lazy(() => import('./ThreeProductViewer'));
import { ArrowUpRight, Sparkles, MessageCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';

export default function HeroSection({ onShopNowClick }) {
  const {
    formatPrice,
    setActiveProduct,
    products,
    heroSettings,
    portraitProductIds,
    setIsPortraitModalOpen
  } = useShop();

  // Admin can override which product shows as hero
  const heroProduct = heroSettings?.heroProductId
    ? (products.find((p) => p.id === heroSettings.heroProductId) || products.find((p) => p.isHero) || products[0])
    : (products.find((p) => p.isHero) || products[0]);

  // Determine effective 3D model based on heroSettings and current heroProduct
  const getHeroModelType = () => {
    const explicit = heroSettings?.heroModelType;
    const prodId = heroProduct?.id || '';
    const prodName = (heroProduct?.name || '').toLowerCase();

    // 1. Explicitly configured model type
    if (explicit === 'natural-glow-mask') return 'natural-glow-mask';
    if (explicit === 'toner') return 'toner';
    if (explicit === 'face-whitening-cream') return 'face-whitening-cream';

    // 2. Intelligent derivation based on current hero product
    if (prodId === 'natural-glow-mask' || prodName.includes('mask')) {
      return 'natural-glow-mask';
    }
    if (prodId === 'whitening-toner' || prodName.includes('toner')) {
      return 'toner';
    }
    if (prodId === 'face-whitening-cream' || (prodName.includes('face') && !prodName.includes('hand'))) {
      return 'face-whitening-cream';
    }

    return explicit === 'hand-feet-cream' ? 'hand-feet-cream' : 'hand-feet-cream';
  };

  const activeModelType = getHeroModelType();

  const badge1 = heroSettings?.heroBadge1 || '✦ 100% Herbal Brightening';
  const badge2 = heroSettings?.heroBadge2 || '✦ Deep Velvet Moisture';

  // Active Hotspot tooltip state
  const [activeSpot, setActiveSpot] = useState(null);

  const hotspots = [
    {
      id: 'barrier',
      title: 'Dewy Glass Sheen',
      desc: 'Infused with pure bio-active ceramides & rose water for light-reflecting radiance.',
      top: '62%',
      left: '36%'
    },
    {
      id: 'hydration',
      title: '72h Active Hydration',
      desc: 'Hyaluronic acid locks deep moisture without clogging pores.',
      top: '70%',
      left: '68%'
    }
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '28px', paddingBottom: '50px' }}>
      {/* Dynamic 3D Background Glow Spheres */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226, 130, 159, 0.22) 0%, rgba(253, 251, 247, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        className="animate-float"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0%',
          left: '2%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214, 166, 133, 0.18) 0%, rgba(253, 251, 247, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top 3D Floating Mini Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
          <span
            className="glow-hover-text"
            onClick={onShopNowClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #F9E7EC 0%, #F7EFE9 100%)',
              color: 'var(--brand-rose-dark)',
              padding: '7px 18px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              boxShadow: '0 4px 14px rgba(226, 130, 159, 0.2)',
              border: '1px solid rgba(226, 130, 159, 0.3)',
              cursor: onShopNowClick ? 'pointer' : 'default'
            }}
          >
            <Sparkles style={{ width: '13px', height: '13px', color: '#C75678' }} />
            IMMERSIVE 3D BOTANICAL RADIANCE • 100% HALAL
          </span>
        </div>

        {/* Editorial 3D Split Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '28px',
            alignItems: 'stretch'
          }}
          className="hero-grid"
        >
          {/* Card 1: 3D Living Model Portrait with interactive face tilt, head tracking, blinking eyes & routine popup */}
          <div style={{ position: 'relative' }}>
            <LivingModelPortrait
              hotspots={hotspots}
              activeSpot={activeSpot}
              setActiveSpot={setActiveSpot}
              onQuickView={() => setIsPortraitModalOpen(true)}
            />
            {/* Visual Callout: Click to shop model's products */}
            <div
              onClick={() => setIsPortraitModalOpen(true)}
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                background: 'rgba(18, 18, 18, 0.78)',
                backdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                border: '1px solid rgba(226, 130, 159, 0.35)',
                zIndex: 6,
                transition: 'all 0.2s ease'
              }}
              title="Click to view all products used on model"
            >
              <Sparkles style={{ width: '12px', height: '12px', color: '#E2829F' }} />
              <span>Shop Model's Routine ({(portraitProductIds || []).length} products)</span>
            </div>
          </div>

          {/* Card 2: Interactive 3D Skincare Jar Stage with Floating 3D Badges */}
          <Tilt3DCard
            maxTilt={8}
            scale={1.01}
            style={{
              position: 'relative',
              borderRadius: '28px',
              padding: 'clamp(18px, 4vw, 36px)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-luxury)',
              overflow: 'hidden'
            }}
          >
            {/* Header: Dynamic Admin Product */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#736C65' }}>
                  {heroProduct.categoryName ? heroProduct.categoryName.toUpperCase() : 'EXCLUSIVE FORMULA'}
                </span>
                <span style={{ background: '#121212', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, padding: '5px 12px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                  {heroProduct.volume || '50ml'}
                </span>
              </div>

              <div style={{ marginTop: '14px' }}>
                <h1
                  className="glow-hover-text"
                  style={{
                    fontSize: 'clamp(30px, 4.2vw, 44px)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.035em'
                  }}
                >
                  {heroProduct.name}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', maxWidth: '360px', lineHeight: 1.5 }}>
                  {heroProduct.description ? heroProduct.description.slice(0, 140) + '...' : heroProduct.tagline}
                </p>
              </div>
            </div>

            {/* 3D Interactive Three.js Product Canvas (Dynamic matching active product) */}
            <div style={{ position: 'relative', width: '100%', margin: '4px 0', zIndex: 1 }}>
              <React.Suspense
                fallback={
                  <div style={{ height: '360px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name}
                      style={{ maxHeight: '280px', maxWidth: '85%', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.12))' }}
                      fetchPriority="high"
                      decoding="async"
                    />
                  </div>
                }
              >
                {activeModelType === 'natural-glow-mask' ? (
                  <div style={{ height: '360px', width: '100%' }}>
                    <ThreeProductViewer productName="Natural Glow Mask" />
                  </div>
                ) : activeModelType === 'face-whitening-cream' ? (
                  <div style={{ height: '360px', width: '100%' }}>
                    <ThreeProductViewer productName="Face Whitening Cream" />
                  </div>
                ) : activeModelType === 'toner' ? (
                  <div style={{ height: '360px', width: '100%' }}>
                    <ThreeProductViewer productName="Herbal Whitening Radiance Toner" />
                  </div>
                ) : (
                  <ThreeHeroJar />
                )}
              </React.Suspense>

              {/* Floating 3D Ingredient Badges Around 3D Jar */}
              <div
                className="floating-badge-1"
                style={{
                  position: 'absolute',
                  top: '12%',
                  right: '4%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#C75678',
                  boxShadow: '0 6px 18px rgba(226, 130, 159, 0.25)',
                  border: '1px solid rgba(226, 130, 159, 0.3)',
                  pointerEvents: 'none'
                }}
              >
                {badge1}
              </div>


              <div
                className="floating-badge-2"
                style={{
                  position: 'absolute',
                  bottom: '18%',
                  left: '4%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#121212',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                  border: '1px solid var(--border-card)',
                  pointerEvents: 'none'
                }}
              >
                {badge2}
              </div>
            </div>

            {/* Bottom Actions & Price */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#121212' }}>
                  {formatPrice(heroProduct.pricePKR, heroProduct.priceUSD)}
                </span>
                <span style={{ fontSize: '15px', color: '#9B948C', textDecoration: 'line-through' }}>
                  {formatPrice(heroProduct.originalPricePKR, heroProduct.originalPriceUSD)}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#C75678', background: 'var(--brand-rose-light)', padding: '3px 10px', borderRadius: '6px' }}>
                  SAVE {heroProduct.originalPricePKR ? Math.round((1 - heroProduct.pricePKR / heroProduct.originalPricePKR) * 100) : 21}%
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }} className="hero-cta-group">
                <button
                  onClick={() => setActiveProduct(heroProduct)}
                  className="btn-primary"
                  style={{ flex: 1, minWidth: '150px' }}
                >
                  <span>Explore 3D Jar</span>
                  <ArrowUpRight style={{ width: '16px', height: '16px' }} />
                </button>

                <a
                  href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(`Hello Ayaana's! I am interested in your ${heroProduct.name} (PKR ${heroProduct.pricePKR}). Please confirm my order.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ textDecoration: 'none' }}
                >
                  <MessageCircle style={{ width: '16px', height: '16px' }} />
                  <span>WhatsApp Order</span>
                </a>
              </div>
            </div>
          </Tilt3DCard>
        </div>
      </div>

      <style>{`
        @media (min-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr 1.18fr !important;
          }
        }
        @media (max-width: 480px) {
          .hero-cta-group {
            flex-direction: column !important;
          }
          .hero-cta-group button,
          .hero-cta-group a {
            width: 100% !important;
            min-width: 100% !important;
            box-sizing: border-box !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
}

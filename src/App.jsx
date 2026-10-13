import React, { useState, useRef } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ZeroGravityShowcase from './components/ZeroGravityShowcase';
import BrandValues from './components/BrandValues';
import Marquee3D from './components/Marquee3D';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import BeforeAfterSection from './components/BeforeAfterSection';
import ProductSpotlight from './components/ProductSpotlight';
import RitualGuide from './components/RitualGuide';
import ReviewsSection from './components/ReviewsSection';
import WhatsAppBanner from './components/WhatsAppBanner';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProductModal from './components/ProductModal';
import ModelRoutineModal from './components/ModelRoutineModal';
import CustomCursor from './components/CustomCursor';
import ThreeBackground from './components/ThreeBackground';
import { MessageCircle, Sparkles, GripVertical } from 'lucide-react';
import { BRAND_CONFIG } from './data/products';

// Code-split heavy modals to keep initial bundle ultra light on mobile
const CheckoutModal = React.lazy(() => import('./components/CheckoutModal'));
const OrderTrackingModal = React.lazy(() => import('./components/OrderTrackingModal'));
const AdminModal = React.lazy(() => import('./components/AdminModal'));


function MainStore() {
  const { products, isAdminLoggedIn, moveProduct } = useShop();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const catalogRef = useRef(null);

  // Filter products
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 1. Interactive 3D WebGL Particle Background */}
      <ThreeBackground />

      {/* 2. Custom Luxury 3D Cursor & Glowing Aura */}
      <CustomCursor />

      {/* 3. Header & Navigation */}
      <Navbar
        onCategorySelect={handleCategorySelect}
        onScrollToSection={handleScrollToSection}
      />

      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {/* 4. Immersive 3D Hero Section */}
        <HeroSection
          onShopNowClick={() => {
            if (catalogRef.current) {
              catalogRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* 5. 16:9 Zero-Gravity 8K Products Cinematic Showcase */}
        <ZeroGravityShowcase />

        {/* 6. Tilted 3D Perspective Marquee Ribbon */}
        <Marquee3D />

        {/* 6. Luxury Brand Assurances */}
        <BrandValues />

        {/* 7. Product Catalog Feed with 3D Gyroscopic Perspective Tilt */}
        <section ref={catalogRef} id="catalog" style={{ padding: '80px 0 60px 0' }}>
          <div className="container">
            {/* Section Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--brand-rose-light)', color: 'var(--brand-rose-dark)', padding: '6px 16px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '12px' }}>
                <Sparkles style={{ width: '13px', height: '13px' }} />
                CURATED BOTANICAL FORMULATIONS
              </div>
              <h2
                className="glow-hover-text"
                style={{
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15
                }}
              >
                The Radiance <span style={{ color: '#C75678', fontStyle: 'italic' }}>Collection</span>
              </h2>
              <p style={{ color: '#736C65', fontSize: '15px', marginTop: '8px', maxWidth: '520px' }}>
                Hover over any formulation to experience interactive 3D depth, light refractions, and clinical active ingredient breakdown.
              </p>
            </div>

            {/* Category Filter Pills */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Owner Drag & Drop Reorder Notice */}
            {isAdminLoggedIn && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(226, 130, 159, 0.12), rgba(18, 18, 18, 0.04))',
                  border: '1.5px dashed #C75678',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GripVertical style={{ width: '18px', height: '18px', color: '#C75678' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#121212' }}>
                    Owner Mode: Kisi bhi product ko drag kr k apni pasandeeda position pr rakhein! #1 product pehle show hogi.
                  </span>
                </div>
                <span style={{ fontSize: '11px', background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, color: '#C75678', border: '1px solid rgba(199, 86, 120, 0.2)' }}>
                  ✨ Drag to Reorder Active
                </span>
              </div>
            )}

            {/* Products Grid with 3D Tilt Cards and Drag & Drop */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                gap: '24px'
              }}
            >
              {filteredProducts.map((product) => {
                const productGlobalIndex = products.findIndex((p) => p.id === product.id);
                const isFirst = productGlobalIndex === 0;

                return (
                  <div
                    key={product.id}
                    draggable={isAdminLoggedIn}
                    onDragStart={(e) => {
                      if (!isAdminLoggedIn) return;
                      e.dataTransfer.setData('text/plain', product.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedId(product.id);
                    }}
                    onDragOver={(e) => {
                      if (!isAdminLoggedIn) return;
                      e.preventDefault();
                      if (dragOverId !== product.id) setDragOverId(product.id);
                    }}
                    onDragLeave={() => {
                      if (dragOverId === product.id) setDragOverId(null);
                    }}
                    onDrop={(e) => {
                      if (!isAdminLoggedIn) return;
                      e.preventDefault();
                      const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
                      if (sourceId && sourceId !== product.id) {
                        const fromIdx = products.findIndex((p) => p.id === sourceId);
                        const toIdx = products.findIndex((p) => p.id === product.id);
                        if (fromIdx !== -1 && toIdx !== -1) {
                          moveProduct(fromIdx, toIdx);
                        }
                      }
                      setDraggedId(null);
                      setDragOverId(null);
                    }}
                    style={{
                      position: 'relative',
                      cursor: isAdminLoggedIn ? 'grab' : 'default',
                      transition: 'transform 0.2s ease, opacity 0.2s ease',
                      opacity: draggedId === product.id ? 0.45 : 1,
                      transform: dragOverId === product.id ? 'scale(1.03)' : 'none',
                      borderRadius: '24px',
                      boxShadow: dragOverId === product.id ? '0 0 0 2.5px #C75678, 0 12px 24px rgba(199, 86, 120, 0.2)' : 'none'
                    }}
                  >
                    {isAdminLoggedIn && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          zIndex: 25,
                          background: isFirst ? '#128C7E' : 'rgba(18, 18, 18, 0.88)',
                          color: '#FFFFFF',
                          backdropFilter: 'blur(6px)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          pointerEvents: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        <GripVertical style={{ width: '12px', height: '12px' }} />
                        <span>#{productGlobalIndex + 1} {isFirst ? '★ 1st' : ''}</span>
                      </div>
                    )}
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. Real Before & After Slider (Verified WhatsApp Proof) */}
        <BeforeAfterSection />

        {/* 9. 3D Product Spotlight & Ingredient Science */}
        <ProductSpotlight />

        {/* 10. 3-Step Daily Radiance Ritual */}
        <RitualGuide />

        {/* 11. Customer Testimonials & WhatsApp Reviews */}
        <ReviewsSection />

        {/* 12. VIP WhatsApp Skin Concierge */}
        <WhatsAppBanner />
      </main>

      {/* 13. Luxury Editorial Footer */}
      <Footer
        onCategorySelect={handleCategorySelect}
        onScrollToSection={handleScrollToSection}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}?text=${encodeURIComponent("Hello Ayaana's! I am browsing your online store and would like to order or ask a question.")}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
          right: 'max(16px, env(safe-area-inset-right, 16px))',
          backgroundColor: '#25D366',
          color: '#FFFFFF',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          zIndex: 90,
          textDecoration: 'none',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="animate-float"
        title="Chat with Ayaana on WhatsApp"
      >
        <MessageCircle style={{ width: '28px', height: '28px' }} />
      </a>

      {/* Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <ProductModal />
      <ModelRoutineModal />
      <React.Suspense fallback={null}>
        <CheckoutModal />
        <OrderTrackingModal />
        <AdminModal />
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <MainStore />
    </ShopProvider>
  );
}

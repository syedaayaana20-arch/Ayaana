import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, Star, Plus, Minus, ShoppingBag, MessageCircle, Sparkles, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

const ThreeProductViewer = React.lazy(() => import('./ThreeProductViewer'));

export default function ProductModal() {
  const {
    activeProduct,
    setActiveProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    generateSingleProductWhatsAppUrl,
    products
  } = useShop();

  const modalBodyRef = useRef(null);

  // 1. All hooks must execute unconditionally at top level
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'photo'
  const [selectedVolume, setSelectedVolume] = useState('50ml');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 2. Synchronize state when activeProduct changes (React adjusting state pattern)
  const [prevId, setPrevId] = useState(activeProduct?.id);
  if (activeProduct && prevId !== activeProduct.id) {
    setPrevId(activeProduct.id);
    setSelectedVolume(activeProduct.volume || '50ml');
    setQuantity(1);
    setActiveTab('description');
    setIsDescriptionExpanded(false);
    setSelectedImageIndex(0);
    const has3DView = activeProduct.has3D !== false && (activeProduct.category === 'toners' || (activeProduct.name || '').toLowerCase().includes('toner') || activeProduct.category === 'repair-creams' || activeProduct.category === 'glow-masks');
    setViewMode(has3DView ? '3d' : 'photo');
  }

  useEffect(() => {
    if (activeProduct && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [activeProduct]);

  // 3. Early return ONLY after all hooks are declared
  if (!activeProduct) return null;

  const isFavorited = isInWishlist(activeProduct.id);

  // Safe fallback properties
  const prodVolume = activeProduct.volume || '50ml';
  const volumeOptions = [
    prodVolume,
    prodVolume.includes('120ml')
      ? '240ml (Duo Pack)'
      : (prodVolume.includes('50ml') ? '100ml (Duo Value)' : (prodVolume.includes('30ml') ? '60ml (Luxury Size)' : '100ml'))
  ];

  // Related products from the same or complementary category
  const relatedProducts = (products || [])
    .filter((p) => p.id !== activeProduct.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(activeProduct, quantity, selectedVolume);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1500);
  };

  const isToner = activeProduct?.category === 'toners' || (activeProduct?.name || '').toLowerCase().includes('toner');
  const isJar = activeProduct?.category === 'repair-creams' || activeProduct?.category === 'glow-masks';
  const has3D = activeProduct?.has3D === false ? false : (isToner || isJar);

  return (
    <div className="overlay-backdrop modal-overlay" onClick={() => setActiveProduct(null)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          backgroundColor: '#FDFBF7'
        }}
      >
        {/* Modal Top Bar (Sticky at top of modal) */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid rgba(18, 18, 18, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <button
            onClick={() => setActiveProduct(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: 700,
              color: '#736C65',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
            <span>Close</span>
          </button>

          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', color: '#9B948C', textTransform: 'uppercase' }}>
            {activeProduct.categoryName || 'Luxury Skincare'}
          </span>

          <button
            onClick={() => toggleWishlist(activeProduct)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isFavorited ? '#E2829F' : '#9B948C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
            aria-label="Wishlist"
          >
            <Heart style={{ width: '20px', height: '20px', fill: isFavorited ? '#E2829F' : 'none' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          ref={modalBodyRef}
          style={{
            padding: 'clamp(16px, 3.5vw, 28px) clamp(14px, 3vw, 24px)',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 70px)'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'clamp(20px, 3vw, 36px)',
              alignItems: 'start'
            }}
          >
            {/* Left Column: Media Stage (3D Inspector / Photo View) */}
            <div>
              {/* View Mode Toggle Switch */}
              {has3D && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '3px', borderRadius: '9999px', border: '1px solid var(--border-card)' }}>
                    <button
                      onClick={() => setViewMode('3d')}
                      style={{
                        background: viewMode === '3d' ? '#121212' : 'transparent',
                        color: viewMode === '3d' ? '#FFFFFF' : '#736C65',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Sparkles style={{ width: '13px', height: '13px' }} />
                      <span>{isToner ? '3D Interactive Bottle' : '3D Interactive Jar'}</span>
                    </button>
                    <button
                      onClick={() => setViewMode('photo')}
                      style={{
                        background: viewMode === 'photo' ? '#121212' : 'transparent',
                        color: viewMode === 'photo' ? '#FFFFFF' : '#736C65',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Studio Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Stage Canvas / Photo Frame */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-card)',
                  aspectRatio: '1 / 1',
                  maxHeight: '380px',
                  margin: '0 auto',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {viewMode === '3d' ? (
                  <React.Suspense
                    fallback={
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9B948C', fontSize: '12px' }}>
                        <Sparkles style={{ width: '20px', height: '20px', color: '#E2829F' }} />
                        <span>Loading 3D Studio...</span>
                      </div>
                    }
                  >
                    <ThreeProductViewer productName={activeProduct.name} />
                  </React.Suspense>
                ) : (
                  <img
                    src={(Array.isArray(activeProduct.images) && activeProduct.images[selectedImageIndex]) || activeProduct.image}
                    alt={activeProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                {/* Volume Tag */}
                <span
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#121212'
                  }}
                >
                  {selectedVolume}
                </span>
              </div>

              {/* Multiple Images Thumbnail Strip */}
              {Array.isArray(activeProduct.images) && activeProduct.images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {activeProduct.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setViewMode('photo');
                      }}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        padding: 0,
                        border: selectedImageIndex === idx && viewMode === 'photo' ? '2px solid #121212' : '1px solid var(--border-card)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        background: '#FFFFFF'
                      }}
                    >
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Key Assurance Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-card)', fontSize: '11.5px', color: '#2E2B28' }}>
                  <Truck style={{ width: '16px', height: '16px', color: '#128C7E', flexShrink: 0 }} />
                  <span>Express 2-3 Day Nationwide Delivery</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-card)', fontSize: '11.5px', color: '#2E2B28' }}>
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#C75678', flexShrink: 0 }} />
                  <span>100% Halal & Organic Certified</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Information & Purchase Panel */}
            <div>
              {/* Rating Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', color: '#D6A685' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: '14px', height: '14px', fill: '#D6A685' }} />
                  ))}
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#121212' }}>
                  {activeProduct.rating || 4.9}
                </span>
                <span style={{ fontSize: '12px', color: '#736C65' }}>
                  ({(activeProduct.reviewsCount || 850).toLocaleString()} reviews)
                </span>
              </div>

              {/* Title & Tagline */}
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#121212', lineHeight: 1.2, marginBottom: '6px' }}>
                {activeProduct.name}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#C75678', fontWeight: 600, marginBottom: '16px' }}>
                {activeProduct.tagline}
              </p>

              {/* Price Box */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(18, 18, 18, 0.08)' }}>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#121212' }}>
                  {formatPrice(activeProduct.pricePKR, activeProduct.priceUSD)}
                </span>
                <span style={{ fontSize: '15px', color: '#9B948C', textDecoration: 'line-through' }}>
                  {formatPrice(activeProduct.originalPricePKR, activeProduct.originalPriceUSD)}
                </span>
                {activeProduct.originalPricePKR && activeProduct.pricePKR && activeProduct.originalPricePKR > activeProduct.pricePKR && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#C75678', background: 'var(--brand-rose-light)', padding: '3px 8px', borderRadius: '4px' }}>
                    SAVE {Math.round(((activeProduct.originalPricePKR - activeProduct.pricePKR) / activeProduct.originalPricePKR) * 100)}%
                  </span>
                )}
              </div>

              {/* Size / Volume Option Pills */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#121212', display: 'block', marginBottom: '8px' }}>
                  Select Volume:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {volumeOptions.map((vol) => (
                    <button
                      key={vol}
                      onClick={() => setSelectedVolume(vol)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        transition: 'all 0.2s',
                        backgroundColor: selectedVolume === vol ? '#121212' : '#FFFFFF',
                        color: selectedVolume === vol ? '#FFFFFF' : '#121212',
                        borderColor: selectedVolume === vol ? '#121212' : 'rgba(18, 18, 18, 0.12)'
                      }}
                    >
                      {vol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Add to Cart Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '9999px', border: '1px solid var(--border-card)' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#121212' }}
                  >
                    <Minus style={{ width: '14px', height: '14px' }} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#121212' }}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <button
                  onClick={handleAddToCart}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    backgroundColor: addedNotice ? '#C75678' : '#121212',
                    padding: '13px 20px'
                  }}
                >
                  <ShoppingBag style={{ width: '16px', height: '16px' }} />
                  <span>{addedNotice ? "Added to Bag ✓" : "Add to Cart"}</span>
                </button>
              </div>

              {/* 1-Click WhatsApp Purchase */}
              <a
                href={generateSingleProductWhatsAppUrl(activeProduct, selectedVolume)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ width: '100%', textDecoration: 'none', boxSizing: 'border-box', marginBottom: '28px' }}
              >
                <MessageCircle style={{ width: '18px', height: '18px' }} />
                <span>Direct Order via WhatsApp</span>
              </a>

              {/* SORA Inspired Tabbed Navigation (Screen 3 Reference) */}
              <div style={{ borderTop: '1px solid rgba(18, 18, 18, 0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(18, 18, 18, 0.06)', paddingBottom: '10px', overflowX: 'auto' }}>
                  {['description', 'howToUse', 'ingredients', 'clinicalResults'].map((tabKey) => {
                    const titles = {
                      description: 'Description',
                      howToUse: 'How To Use',
                      ingredients: 'Ingredients',
                      clinicalResults: 'Results'
                    };
                    const isCur = activeTab === tabKey;
                    return (
                      <button
                        key={tabKey}
                        onClick={() => setActiveTab(tabKey)}
                        style={{
                          background: isCur ? 'var(--bg-card)' : 'none',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '9999px',
                          fontSize: '12.5px',
                          fontWeight: isCur ? 700 : 500,
                          color: isCur ? '#121212' : '#736C65',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s'
                        }}
                      >
                        {titles[tabKey]}
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Content */}
                <div style={{ padding: '16px 0', fontSize: '13px', color: '#2E2B28', lineHeight: 1.6 }}>
                  {activeTab === 'description' && (
                    <div>
                      <p style={{ display: isDescriptionExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isDescriptionExpanded ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {activeProduct.description}
                      </p>
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        style={{ background: 'none', border: 'none', color: '#C75678', fontWeight: 700, fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
                      >
                        {isDescriptionExpanded ? 'Show Less' : 'See More...'}
                      </button>
                    </div>
                  )}

                  {activeTab === 'howToUse' && (
                    <p>{activeProduct.howToUse}</p>
                  )}

                  {activeTab === 'ingredients' && (
                    <p style={{ fontStyle: 'italic', color: '#55514E' }}>{activeProduct.ingredients}</p>
                  )}

                  {activeTab === 'clinicalResults' && (
                    <div>
                      <p style={{ fontWeight: 600, color: '#C75678', marginBottom: '8px' }}>
                        {activeProduct.clinicalResults}
                      </p>
                      <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(activeProduct.benefits && activeProduct.benefits.length > 0
                          ? activeProduct.benefits
                          : ["Restores luminous radiant glow", "Deeply hydrates and reinforces skin barrier"]
                        ).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Related Products Section */}
          <div style={{ padding: 'clamp(16px, 3vw, 24px) clamp(14px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(18, 18, 18, 0.08)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Frequently Paired Together:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    setActiveProduct(rel);
                    modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-card)',
                    cursor: 'pointer',
                    border: '1px solid var(--border-card)'
                  }}
                >
                  <img src={rel.image} alt={rel.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '12.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rel.name}</h5>
                    <span style={{ fontSize: '11px', color: '#C75678', fontWeight: 600 }}>{formatPrice(rel.pricePKR, rel.priceUSD)}</span>
                  </div>
                  <ArrowRight style={{ width: '14px', height: '14px', color: '#736C65' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Sparkles, ShoppingBag, Eye, MessageCircle, ArrowRight } from 'lucide-react';

export default function ModelRoutineModal() {
  const {
    isPortraitModalOpen,
    setIsPortraitModalOpen,
    portraitProductIds,
    products,
    setActiveProduct,
    addToCart,
    formatPrice,
    generateSingleProductWhatsAppUrl
  } = useShop();

  if (!isPortraitModalOpen) return null;

  // Resolve product objects
  const routineProducts = (portraitProductIds || [])
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  // Fallback to top products if none configured
  const displayProducts = routineProducts.length > 0
    ? routineProducts
    : products.slice(0, 2);

  const handleAddAllToCart = () => {
    displayProducts.forEach(prod => {
      addToCart(prod, 1);
    });
    setIsPortraitModalOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 16, 14, 0.72)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={() => setIsPortraitModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 130, 159, 0.25)',
          overflow: 'hidden',
          animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #FAF4EF 0%, #F5EAE1 100%)',
            borderBottom: '1px solid rgba(226, 130, 159, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, color: '#C75678', marginBottom: '6px', border: '1px solid rgba(226, 130, 159, 0.3)' }}>
              <Sparkles style={{ width: '12px', height: '12px' }} />
              MODEL'S GLOW FORMULATION
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#121212' }}>
              The Living Model's Skincare Routine
            </h3>
            <p style={{ fontSize: '12.5px', color: '#736C65', margin: '4px 0 0 0' }}>
              Products featured on our interactive 3D model for luminous glass radiance.
            </p>
          </div>

          <button
            onClick={() => setIsPortraitModalOpen(false)}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(18, 18, 18, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#121212',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            aria-label="Close"
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Scrollable Products List */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displayProducts.map((prod) => (
            <div
              key={prod.id}
              className="routine-product-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: '#FAF7F2',
                border: '1px solid var(--border-card)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Product Thumbnail */}
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(18, 18, 18, 0.08)'
                }}
              >
                <img
                  src={prod.image || prod.images?.[0]}
                  alt={prod.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Product Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#C75678', letterSpacing: '0.05em' }}>
                    {prod.volume || '50ml'}
                  </span>
                  {prod.badge && (
                    <span style={{ fontSize: '9.5px', background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(18,18,18,0.1)' }}>
                      {prod.badge}
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: '#121212', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prod.name}
                </h4>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#C75678', marginTop: '3px' }}>
                  {formatPrice(prod.pricePKR, prod.priceUSD)}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    addToCart(prod, 1);
                  }}
                  className="btn-primary"
                  style={{
                    padding: '7px 12px',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <ShoppingBag style={{ width: '13px', height: '13px' }} />
                  <span>Add to Bag</span>
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      setIsPortraitModalOpen(false);
                      setActiveProduct(prod);
                    }}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(18, 18, 18, 0.15)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye style={{ width: '12px', height: '12px' }} />
                    <span>View</span>
                  </button>

                  <a
                    href={generateSingleProductWhatsAppUrl(prod)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '5px 8px',
                      background: '#25D366',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Order directly on WhatsApp"
                  >
                    <MessageCircle style={{ width: '12px', height: '12px' }} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Bulk Add */}
        <div
          className="routine-modal-footer"
          style={{
            padding: '16px 24px',
            backgroundColor: '#FAF7F2',
            borderTop: '1px solid rgba(18, 18, 18, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '12.5px', color: '#736C65', fontWeight: 600 }}>
            {displayProducts.length} items in this ritual
          </span>

          <button
            onClick={handleAddAllToCart}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Add Complete Ritual to Bag</span>
            <ArrowRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        <style>{`
          @media (max-width: 480px) {
            .routine-product-card {
              flex-wrap: wrap !important;
            }
            .routine-modal-footer {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .routine-modal-footer button {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

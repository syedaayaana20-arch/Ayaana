import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  Truck,
  Lock,
  Unlock,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';

export default function Navbar({ onCategorySelect, onScrollToSection }) {
  const {
    totalCartCount,
    wishlist,
    currency,
    setCurrency,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsTrackingOpen,
    setIsAdminOpen,
    isAdminLoggedIn,
    currentAdminUser,
    products
  } = useShop();


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(253, 251, 247, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(18, 18, 18, 0.06)' }}>
      {/* 1. Announcement Bar */}
      <div
        className="announcement-bar"
        style={{
          backgroundColor: '#121212',
          color: '#FFFFFF',
          fontSize: 'clamp(9.5px, 2.7vw, 11px)',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          textAlign: 'center',
          flexWrap: 'wrap'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles style={{ width: '12px', height: '12px', color: '#E2829F', flexShrink: 0 }} />
          <span>Complimentary Delivery over Rs. 3,000 / $25</span>
        </span>
        <span className="announcement-divider" style={{ opacity: 0.4 }}>|</span>
        <span style={{ color: '#E2829F' }}>
          Code: <strong>GLOW10</strong> (10% OFF)
        </span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'clamp(66px, 8vw, 82px)', gap: '10px' }}>
        {/* Left: Desktop Nav Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          <button
            onClick={() => onCategorySelect('all')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#121212', letterSpacing: '0.02em', transition: 'var(--transition-smooth)' }}
            className="nav-link"
          >
            Collection
          </button>
          <button
            onClick={() => onCategorySelect('repair-creams')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#736C65', letterSpacing: '0.02em', transition: 'var(--transition-smooth)' }}
            className="nav-link"
          >
            Skin Repair
          </button>
          <button
            onClick={() => onScrollToSection('before-after')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#736C65', letterSpacing: '0.02em', transition: 'var(--transition-smooth)' }}
            className="nav-link"
          >
            Real Results
          </button>
          <button
            onClick={() => onScrollToSection('reviews')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#736C65', letterSpacing: '0.02em', transition: 'var(--transition-smooth)' }}
            className="nav-link"
          >
            Reviews
          </button>
        </nav>

        {/* Mobile Hamburger Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-only-btn">
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setIsMobileMenuOpen(true);
            }}
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#121212' }}
            aria-label="Open navigation menu"
          >
            <Menu style={{ width: '22px', height: '22px' }} />
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(!isSearchOpen);
            }}
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#121212' }}
            aria-label="Search"
          >
            <Search style={{ width: '19px', height: '19px' }} />
          </button>
        </div>

        {/* Center: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/assets/logo.png"
            alt="Ayaana's Logo"
            style={{ width: 'clamp(36px, 8vw, 46px)', height: 'clamp(36px, 8vw, 46px)', objectFit: 'contain', borderRadius: '50%' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#121212', lineHeight: 1 }}>
              Ayaana’s
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C75678', marginTop: '2px' }}>
              Pure Radiance
            </span>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)' }}>
          {/* Desktop Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={{ display: 'none', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', padding: '8px 14px', borderRadius: '9999px', fontSize: '13px', color: '#736C65', cursor: 'pointer' }}
            className="desktop-search-btn"
          >
            <Search style={{ width: '15px', height: '15px', color: '#121212' }} />
            <span>Search skincare...</span>
          </button>

          {/* Currency Switcher */}
          <div className="currency-switcher-nav" style={{ display: 'flex', background: 'var(--bg-card)', padding: '3px', borderRadius: '9999px', border: '1px solid var(--border-card)' }}>
            <button
              onClick={() => setCurrency('PKR')}
              style={{
                background: currency === 'PKR' ? '#121212' : 'transparent',
                color: currency === 'PKR' ? '#FFFFFF' : '#736C65',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              PKR ₨
            </button>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                background: currency === 'USD' ? '#121212' : 'transparent',
                color: currency === 'USD' ? '#FFFFFF' : '#736C65',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              USD $
            </button>
          </div>

          {/* Track Order Trigger */}
          <button
            onClick={() => setIsTrackingOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#121212', padding: '6px' }}
            title="Track Order"
            aria-label="Track Order"
            className="track-btn"
          >
            <Truck style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#121212', position: 'relative', padding: '6px' }}
            aria-label="Wishlist"
          >
            <Heart style={{ width: '20px', height: '20px' }} />
            {wishlist.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  background: '#E2829F',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Bag Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#121212',
              color: '#FFFFFF',
              padding: '8px clamp(10px, 2.5vw, 16px)',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(18, 18, 18, 0.15)',
              transition: 'var(--transition-smooth)'
            }}
            className="cart-nav-btn"
          >
            <ShoppingBag style={{ width: '16px', height: '16px' }} />
            <span className="cart-text">Bag</span>
            <span
              style={{
                background: '#E2829F',
                color: '#FFFFFF',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '9999px',
                marginLeft: '2px'
              }}
            >
              {totalCartCount}
            </span>
          </button>

          {/* Owner / Admin Protected Access Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="admin-header-btn"
            style={{
              background: isAdminLoggedIn ? '#121212' : 'var(--bg-card)',
              border: isAdminLoggedIn ? '1px solid #E2829F' : '1px solid var(--border-card)',
              color: isAdminLoggedIn ? '#E2829F' : '#736C65',
              cursor: 'pointer',
              padding: isAdminLoggedIn ? '6px 12px' : '7px 10px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title={isAdminLoggedIn ? "Open Owner Dashboard (Logged In)" : "Owner / Admin Login"}
            aria-label="Owner / Admin Login"
          >
            {isAdminLoggedIn ? (
              <>
                <Unlock style={{ width: '13px', height: '13px', color: '#E2829F' }} />
                <span className="owner-login-text">{currentAdminUser?.role === 'Super Admin' ? 'Super Admin' : 'Store Admin'}</span>
              </>
            ) : (
              <>
                <Lock style={{ width: '14px', height: '14px' }} />
                <span className="owner-login-text">Login</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Live Search Bar & Autocomplete Panel */}
      {isSearchOpen && (
        <div
          style={{
            borderTop: '1px solid rgba(18, 18, 18, 0.06)',
            padding: '16px 0',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '10px 18px', borderRadius: '9999px' }}>
              <Search style={{ width: '18px', height: '18px', color: '#736C65' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, concern, or category..."
                autoFocus
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px',
                  color: '#121212',
                  fontWeight: 500
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#736C65', padding: '2px' }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{ background: '#121212', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

            {/* Instant Search Results Dropdown */}
            {searchQuery && (
              <div
                style={{
                  marginTop: '16px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid var(--border-card)',
                  padding: '12px',
                  maxHeight: '340px',
                  overflowY: 'auto'
                }}
              >
                {searchResults.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveProduct(item);
                          setIsSearchOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: 'var(--bg-surface)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </h4>
                          <span style={{ fontSize: '11.5px', color: '#C75678', fontWeight: 600 }}>
                            {formatPrice(item.pricePKR, item.priceUSD)}
                          </span>
                        </div>
                        <ArrowRight style={{ width: '14px', height: '14px', color: '#736C65' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#736C65', fontSize: '14px' }}>
                    No products found matching "{searchQuery}". Try "cream", "toner", or "serum".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Mobile Slide-out Menu Drawer (Portaled to document.body) */}
      {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="overlay-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            height: '100dvh',
            backgroundColor: 'rgba(18, 18, 18, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'flex-start'
          }}
        >
          <div
            className="slide-drawer-left"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              height: '100dvh',
              backgroundColor: '#FDFBF7',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 20px 24px 20px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(18, 18, 18, 0.08)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/assets/logo.png" alt="Ayaana's" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '18px', color: '#121212', display: 'block', lineHeight: 1.1 }}>Ayaana’s</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C75678' }}>Pure Radiance</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '50%', cursor: 'pointer', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121212' }}
                aria-label="Close menu"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Currency Switcher in Drawer for Mobile Users */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-card)', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#736C65' }}>Store Currency:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setCurrency('PKR')}
                  style={{
                    background: currency === 'PKR' ? '#121212' : '#FFFFFF',
                    color: currency === 'PKR' ? '#FFFFFF' : '#121212',
                    border: '1px solid rgba(18, 18, 18, 0.1)',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  PKR ₨
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  style={{
                    background: currency === 'USD' ? '#121212' : '#FFFFFF',
                    color: currency === 'USD' ? '#FFFFFF' : '#121212',
                    border: '1px solid rgba(18, 18, 18, 0.1)',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  USD $
                </button>
              </div>
            </div>

            {/* PROMINENT Owner / Admin Login Action Card (Direct Mobile Access) */}
            <div style={{ marginBottom: '16px', flexShrink: 0 }}>
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isAdminLoggedIn
                    ? 'linear-gradient(135deg, rgba(18, 140, 126, 0.12) 0%, rgba(18, 140, 126, 0.04) 100%)'
                    : 'linear-gradient(135deg, #121212 0%, #2A2624 100%)',
                  border: isAdminLoggedIn ? '1.5px solid #128C7E' : '1px solid rgba(0,0,0,0.1)',
                  color: isAdminLoggedIn ? '#128C7E' : '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: isAdminLoggedIn ? '#128C7E' : 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0
                    }}
                  >
                    {isAdminLoggedIn ? <Unlock style={{ width: '18px', height: '18px' }} /> : <Lock style={{ width: '18px', height: '18px' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-0.01em', color: isAdminLoggedIn ? '#128C7E' : '#FFFFFF' }}>
                      {isAdminLoggedIn ? (currentAdminUser?.role === 'Super Admin' ? 'Super Admin Dashboard' : 'Store Admin Dashboard') : "Owner / Admin Login"}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 500, color: isAdminLoggedIn ? '#128C7E' : 'rgba(255,255,255,0.7)' }}>
                      {isAdminLoggedIn ? `Logged in: ${currentAdminUser?.name || 'Admin'} (${currentAdminUser?.role || 'Store Admin'})` : "Secure store & catalog control"}
                    </div>
                  </div>
                </div>
                <ArrowRight style={{ width: '16px', height: '16px', opacity: 0.8, color: isAdminLoggedIn ? '#128C7E' : '#FFFFFF' }} />
              </button>
            </div>

            {/* Scrollable Navigation Links */}
            <nav
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
                paddingRight: '4px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B948C', marginBottom: '2px' }}>
                Categories & Proof
              </div>

              <button
                onClick={() => {
                  onCategorySelect('all');
                  setIsMobileMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '15px', fontWeight: 700, color: '#121212', cursor: 'pointer', padding: '6px 0' }}
              >
                All Products
              </button>
              <button
                onClick={() => {
                  onCategorySelect('repair-creams');
                  setIsMobileMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '15px', fontWeight: 600, color: '#2E2B28', cursor: 'pointer', padding: '6px 0' }}
              >
                Skin Repair Creams
              </button>
              <button
                onClick={() => {
                  onCategorySelect('toners');
                  setIsMobileMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '15px', fontWeight: 600, color: '#2E2B28', cursor: 'pointer', padding: '6px 0' }}
              >
                Whitening Toners
              </button>
              <button
                onClick={() => {
                  onCategorySelect('serums');
                  setIsMobileMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '15px', fontWeight: 600, color: '#2E2B28', cursor: 'pointer', padding: '6px 0' }}
              >
                24K Radiance Serums
              </button>
              <button
                onClick={() => {
                  onCategorySelect('hand-foot');
                  setIsMobileMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '15px', fontWeight: 600, color: '#2E2B28', cursor: 'pointer', padding: '6px 0' }}
              >
                Hand & Foot Brightening
              </button>
              <button
                onClick={() => {
                  onScrollToSection('before-after');
                  setIsMobileMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '15px', fontWeight: 600, color: '#C75678', cursor: 'pointer', padding: '6px 0' }}
              >
                Real Before & After Results
              </button>

              <div style={{ height: '1px', background: 'rgba(18, 18, 18, 0.06)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  setIsTrackingOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '14.5px', fontWeight: 600, color: '#736C65', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 0' }}
              >
                <Truck style={{ width: '18px', height: '18px', color: '#121212' }} />
                <span>Track Your Order</span>
              </button>
            </nav>

            {/* Bottom Support CTA */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(18, 18, 18, 0.08)', flexShrink: 0 }}>
              <a
                href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ width: '100%', textDecoration: 'none', boxSizing: 'border-box' }}
              >
                <MessageCircle style={{ width: '16px', height: '16px' }} />
                <span>WhatsApp Skin Specialist</span>
              </a>
              <p style={{ fontSize: '11px', color: '#9B948C', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
                Official WhatsApp: {BRAND_CONFIG.whatsappDisplay}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Responsive styling rule for desktop vs mobile nav */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-search-btn { display: flex !important; }
          .mobile-only-btn { display: none !important; }
        }
        @media (max-width: 899px) {
          .desktop-nav { display: none !important; }
          .desktop-search-btn { display: none !important; }
          .mobile-only-btn { display: flex !important; }
          .track-btn { display: none !important; }
          .owner-login-text { display: none !important; }
        }
        @media (max-width: 640px) {
          .cart-text { display: none !important; }
          .announcement-divider { display: none !important; }
        }
        @media (max-width: 440px) {
          .currency-switcher-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
}

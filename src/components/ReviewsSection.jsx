import React, { useState, useEffect, useRef } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Pause, Play, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function ReviewsSection() {
  const { siteReviews, products, setActiveProduct } = useShop();

  // Provided customer result images
  const customerProofImages = [
    {
      src: '/assets/customer-proof.jpg',
      alt: 'Ayaana Hand Whitening WhatsApp Customer Result - Before and After',
      title: 'Hand & Feet Whitening Cream',
      tag: '7-Day Real WhatsApp Proof',
      customer: 'Ayaana Customer (Verified WhatsApp, Lahore)',
      comment: '“Se boht zyada bright howy n 😊 Mai apko before and after ke picture bi send krti hu abi 🤗 Hands aur face par itna natural glow aya hai, dark knuckles bilkul fade ho gaye!”'
    },
    {
      src: '/assets/review_customer_1.jpg',
      alt: 'Ayaana Hand & Feet Whitening Cream Customer Result',
      title: 'Hand & Feet Whitening Cream',
      tag: 'Visible Luminous Whitening',
      customer: 'Sania T. (Verified Customer, Lahore)',
      comment: 'Results in 7 days! Mere feet aur dark knuckles par itna visible difference aya hai, skin super soft aur glowing ho gayi hai.'
    },
    {
      src: '/assets/review_customer_2.jpg',
      alt: 'Ayaana Radiance Result - Silky Soft Feet & Toes',
      title: 'Flawless Radiant Finish',
      tag: 'Poreless & Spot-free',
      customer: 'Areeba K. (Verified Customer, Karachi)',
      comment: 'Zero dryness, absolute glow. The tone evened out completely without any peeling or irritation!'
    },
    {
      src: '/assets/review_customer_3.jpg',
      alt: 'Ayaana Barefoot Glow - Smooth Skin Transformation',
      title: '7-Day Glow Renewal',
      tag: '100% Organic & Gentle',
      customer: 'Hira M. (Verified Customer, Islamabad)',
      comment: 'My bare skin looks so clean and healthy. Look at the natural pink tone and clarity!'
    },
    {
      src: '/assets/review_customer_4.jpg',
      alt: 'Ayaana Customer Before-After Demonstration',
      title: 'Luxury Care for Feet & Hands',
      tag: 'Long-Lasting Hydration',
      customer: 'Zainab M. (Verified Customer, Multan)',
      comment: 'Best cream formulation in Pakistan. I wear open sandals with complete confidence now.'
    }
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const slideDuration = 4000; // 4 seconds per slide
  const progressTimerRef = useRef(null);

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const progressInterval = 50; // update progress every 50ms
    const step = (progressInterval / slideDuration) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          setActiveImageIndex((prevIndex) => (prevIndex + 1) % customerProofImages.length);
          return 0;
        }
        return prev + step;
      });
    }, progressInterval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, customerProofImages.length, slideDuration]);

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % customerProofImages.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + customerProofImages.length) % customerProofImages.length);
    setProgress(0);
  };

  // Mobile Touch Swipe Handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    setIsPlaying(false);
    if (e.touches && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };


  // Use admin-managed reviews from context
  const reviews = siteReviews || [];



  const currentImage = customerProofImages[activeImageIndex];

  return (
    <section id="reviews" style={{ padding: '80px 0', backgroundColor: 'var(--bg-base)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--brand-rose-light)', color: 'var(--brand-rose-dark)', padding: '5px 14px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '12px' }}>
            <Star style={{ width: '13px', height: '13px', fill: '#C75678' }} />
            4.9 OUT OF 5.0 RATED BY OVER 7,500 WOMEN
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Loved by Thousands, <br />
            <span style={{ color: '#C75678', fontStyle: 'italic' }}>Proven by Real Skin</span>
          </h2>
          <p style={{ color: '#736C65', fontSize: '15px', marginTop: '12px' }}>
            Authentic customer results and verified testimonials shared directly by women across Pakistan who transformed their skin.
          </p>
        </div>

        {/* Real Customer Results - Interactive Auto-sliding Gallery */}
        <div
          className="glass-panel"
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            marginBottom: '48px',
            border: '1px solid rgba(226, 130, 159, 0.25)',
            boxShadow: 'var(--shadow-luxury)',
            backgroundColor: '#FFFFFF'
          }}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Top gallery bar */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(18, 18, 18, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: '#FAF7F2'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--brand-rose-light)',
                  color: 'var(--brand-rose-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles style={{ width: '16px', height: '16px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#121212', letterSpacing: '-0.01em' }}>
                  Real Customer Transformation Proof
                </h3>
                <span style={{ fontSize: '11.5px', color: '#736C65' }}>
                  Slide {activeImageIndex + 1} of {customerProofImages.length} • Auto-sliding gallery
                </span>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(18, 18, 18, 0.1)',
                  background: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#2E2B28',
                  cursor: 'pointer'
                }}
                title={isPlaying ? 'Pause auto-slide' : 'Resume auto-slide'}
              >
                {isPlaying ? <Pause style={{ width: '12px', height: '12px' }} /> : <Play style={{ width: '12px', height: '12px' }} />}
                <span>{isPlaying ? 'Auto-Slide On' : 'Paused'}</span>
              </button>

              <button
                onClick={handlePrev}
                aria-label="Previous customer photo"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid rgba(18, 18, 18, 0.1)',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#121212'
                }}
              >
                <ChevronLeft style={{ width: '18px', height: '18px' }} />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next customer photo"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid rgba(18, 18, 18, 0.1)',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#121212'
                }}
              >
                <ChevronRight style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '3px', backgroundColor: '#EFEAE2', position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#C75678',
                transition: isPlaying ? 'width 0.05s linear' : 'none'
              }}
            />
          </div>

          {/* Gallery Body */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '0',
              alignItems: 'stretch'
            }}
          >
            {/* Image Stage */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                position: 'relative',
                backgroundColor: '#1E1B19',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                minHeight: 'clamp(280px, 48vw, 480px)',
                maxHeight: '560px',
                touchAction: 'pan-y',
                cursor: 'grab'
              }}
            >
              <img
                key={activeImageIndex}
                src={currentImage.src}
                alt={currentImage.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '560px',
                  objectFit: 'contain',
                  animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />

              {/* Tag overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(18, 18, 18, 0.75)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <ShieldCheck style={{ width: '13px', height: '13px', color: '#25D366' }} />
                <span>{currentImage.tag}</span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(10px)',
                  color: '#121212',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                100% Unfiltered Customer Photo
              </div>
            </div>

            {/* Details and Thumbnails */}
            <div
              style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div>
                {/* Product badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#C75678',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}
                >
                  <Heart style={{ width: '13px', height: '13px', fill: '#C75678' }} />
                  Customer Spotlight
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#121212', lineHeight: 1.25, marginBottom: '12px' }}>
                  {currentImage.title}
                </h3>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', color: '#D6A685', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} style={{ width: '16px', height: '16px', fill: '#D6A685' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#128C7E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                    Verified Customer Photo
                  </span>
                </div>

                {/* Customer quote box */}
                <div
                  style={{
                    backgroundColor: '#FAF5EF',
                    borderLeft: '4px solid #C75678',
                    padding: '16px 18px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#2E2B28', fontStyle: 'italic', lineHeight: 1.55 }}>
                    “{currentImage.comment}”
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#736C65', fontWeight: 600 }}>
                    — {currentImage.customer}
                  </div>
                </div>

                {/* Key Benefits List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ background: '#F8F4EE', padding: '10px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#736C65', fontWeight: 600 }}>TARGET AREA</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#121212' }}>Feet, Hands & Knuckles</div>
                  </div>
                  <div style={{ background: '#F8F4EE', padding: '10px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#736C65', fontWeight: 600 }}>RESULTS IN</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#C75678' }}>5 - 7 Days Ritual</div>
                  </div>
                </div>
              </div>

              {/* Interactive Thumbnail Previews */}
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#736C65', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Select photo to view:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {customerProofImages.map((img, idx) => {
                    const isActive = idx === activeImageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveImageIndex(idx);
                          setProgress(0);
                        }}
                        style={{
                          padding: '0',
                          border: isActive ? '2px solid #C75678' : '1px solid rgba(18, 18, 18, 0.1)',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#121212',
                          cursor: 'pointer',
                          aspectRatio: '1 / 1',
                          position: 'relative',
                          transform: isActive ? 'scale(1.04)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          boxShadow: isActive ? '0 4px 12px rgba(199, 86, 120, 0.3)' : 'none'
                        }}
                      >
                        <img
                          src={img.src}
                          alt={`Thumbnail ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: isActive ? 1 : 0.65
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Written Customer Reviews Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '24px'
          }}
        >
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="card-3d"
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Top Row: Stars & Date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', color: '#D6A685', gap: '2px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} style={{ width: '14px', height: '14px', fill: '#D6A685' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#9B948C' }}>{rev.date}</span>
                </div>

                {/* Review Text */}
                <p style={{ fontSize: '13.5px', color: '#2E2B28', lineHeight: 1.5, marginBottom: '18px', fontStyle: 'italic' }}>
                  “{rev.text}”
                </p>
              </div>

              {/* Bottom Row: Customer Info */}
              <div style={{ borderTop: '1px solid rgba(18, 18, 18, 0.05)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#121212' }}>{rev.name}</h4>
                    <span style={{ fontSize: '11px', color: '#736C65' }}>• {rev.city}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const matched = products?.find(
                        p => (rev.productId && p.id === rev.productId) || 
                             p.name.toLowerCase() === (rev.product || '').toLowerCase()
                      );
                      if (matched && setActiveProduct) {
                        setActiveProduct(matched);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      textAlign: 'left',
                      fontSize: '11px',
                      color: '#C75678',
                      fontWeight: 600,
                      marginTop: '2px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'underline',
                      textDecorationColor: 'rgba(199, 86, 120, 0.35)',
                      textUnderlineOffset: '2px'
                    }}
                    title="Click to view product"
                  >
                    <span>{rev.product}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>↗</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#128C7E', fontSize: '11px', fontWeight: 600 }}>
                  <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


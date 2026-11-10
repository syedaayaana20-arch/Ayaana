import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Truck, ShieldCheck, CreditCard, Banknote, MessageCircle, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartTotal,
    formatCurrency,
    placeOrder,
    generateWhatsAppOrderUrl,
    setIsTrackingOpen
  } = useShop();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    city: 'Lahore',
    address: '',
    notes: '',
    paymentMethod: 'Cash on Delivery (COD)',
    sendWhatsAppCopy: true
  });

  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert("Please fill in your name, phone number, and delivery address.");
      return;
    }
    if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      alert("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    const { order, error } = await placeOrder(formData);
    setIsSubmitting(false);
    if (error || !order) {
      setSubmitError(error || 'Something went wrong. Please try again.');
      return;
    }
    setConfirmedOrder(order);

    // Trigger celebratory luxury confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E2829F', '#D6A685', '#121212', '#FDFBF7']
      });
    } catch {}
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
  };

  return (
    <div className="overlay-backdrop modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(18, 18, 18, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FDFBF7', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck style={{ width: '20px', height: '20px', color: '#128C7E' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#121212' }}>
              {confirmedOrder ? "Order Confirmed!" : "Secure Luxury Checkout"}
            </h3>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="modal-scroll-body">
          {/* Confirmation Screen */}
          {confirmedOrder ? (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: 'var(--brand-rose-light)', color: 'var(--brand-rose-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
              <CheckCircle2 style={{ width: '38px', height: '38px' }} />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#121212', marginBottom: '6px' }}>
              Thank You, {confirmedOrder.customerName}!
            </h3>
            <p style={{ color: '#736C65', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
              Your order <strong>#{confirmedOrder.orderId}</strong> has been received and is being prepared with artisanal care.
            </p>

            {/* Order Details Card */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', maxWidth: '460px', margin: '0 auto 24px auto', textAlign: 'left', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#736C65' }}>Tracking Number:</span>
                <strong style={{ color: '#121212' }}>{confirmedOrder.trackingNo || 'Shared once dispatched'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#736C65' }}>Payment Method:</span>
                <span>{confirmedOrder.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#736C65' }}>Delivery To:</span>
                <span>{confirmedOrder.address}, {confirmedOrder.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(18,18,18,0.06)', fontWeight: 800, fontSize: '15px' }}>
                <span>Total Payable:</span>
                <span>{formatCurrency(confirmedOrder.total)}</span>
              </div>
            </div>

            {/* Next Steps */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <a
                href={generateWhatsAppOrderUrl(confirmedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ textDecoration: 'none' }}
              >
                <MessageCircle style={{ width: '18px', height: '18px' }} />
                <span>Notify Ayaana on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  handleClose();
                  setIsTrackingOpen(true);
                }}
                className="btn-primary"
              >
                <span>Track Order Status</span>
                <Truck style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} style={{ padding: 'clamp(16px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Customer Details */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px', color: '#121212' }}>
                1. Shipping & Contact Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#736C65', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ayesha Malik"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#736C65', display: 'block', marginBottom: '4px' }}>Phone / Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#736C65', display: 'block', marginBottom: '4px' }}>City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Sialkot">Sialkot</option>
                    <option value="Gujranwala">Gujranwala</option>
                    <option value="Other / Overseas">Other / Overseas</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#736C65', display: 'block', marginBottom: '4px' }}>WhatsApp Number (for updates)</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Same as phone or optional"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#736C65', display: 'block', marginBottom: '4px' }}>Complete Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House #, Street, Sector / Area, Landmark"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px', color: '#121212' }}>
                2. Select Payment Method
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '10px' }}>
                {[
                  { id: 'Cash on Delivery (COD)', label: 'Cash on Delivery', desc: 'Pay when courier arrives', icon: Banknote },
                  { id: 'Direct Bank Transfer', label: 'Online Bank Transfer', desc: 'HBL, Meezan, Alfalah', icon: CreditCard },
                  { id: 'JazzCash / EasyPaisa', label: 'JazzCash / EasyPaisa', desc: 'Instant mobile account', icon: ShieldCheck }
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = formData.paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isSelected ? '#121212' : 'rgba(18,18,18,0.12)',
                        backgroundColor: isSelected ? 'var(--bg-card)' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={isSelected}
                        onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                        style={{ marginTop: '3px' }}
                      />
                      <Icon style={{ width: '18px', height: '18px', color: isSelected ? '#C75678' : '#736C65', marginTop: '1px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#121212' }}>{pm.label}</div>
                        <div style={{ fontSize: '11px', color: '#736C65' }}>{pm.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Box */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px 20px', borderRadius: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#736C65' }}>
                <span>Items Subtotal:</span>
                <span>{formatPrice(cartSubtotalPKR, cartSubtotalUSD)}</span>
              </div>
              {appliedDiscount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#C75678' }}>
                  <span>Discount ({appliedDiscount.percent}%):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#736C65' }}>
                <span>Shipping:</span>
                <span style={{ color: isFreeShipping ? '#128C7E' : '#121212', fontWeight: 600 }}>
                  {isFreeShipping ? "FREE" : formatPrice(BRAND_CONFIG.expressDeliveryFeePKR, BRAND_CONFIG.expressDeliveryFeeUSD)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(18,18,18,0.08)', fontSize: '16px', fontWeight: 800, color: '#121212' }}>
                <span>Final Order Amount:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {submitError && (
              <div role="alert" style={{ backgroundColor: '#FDE8ED', border: '1px solid #E2829F', color: '#C75678', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', lineHeight: 1.4 }}>
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '14px', fontSize: '14.5px', opacity: isSubmitting ? 0.7 : 1 }}
            >
              <span>{isSubmitting ? 'Placing your order...' : 'Confirm & Place Order'}</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}

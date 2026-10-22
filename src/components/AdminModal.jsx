import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Lock,
  Unlock,
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  Save,
  LogOut,
  Key,
  MessageCircle,
  Eye,
  EyeOff,
  Check,
  Users,
  Database,
  Image,
  UploadCloud,
  Search,
  ShieldCheck,
  GripVertical,
  Star,
  Settings2,
  Layout,
  Sliders
} from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';

export default function AdminModal() {
  const {
    isAdminOpen,
    setIsAdminOpen,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    adminsList,
    addNewAdmin,
    deleteAdmin,
    currentAdminUser,
    updateAdminPassword,
    products,
    addNewProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    moveProductToFirst,
    moveProduct,
    recentOrders,
    updateOrderStatus,
    formatPrice,
    // Site Customization
    heroSettings,
    updateHeroSettings,
    transformationModel,
    updateTransformationModel,
    portraitProductIds,
    updatePortraitProductIds,
    siteReviews,
    addReview,
    deleteReview
  } = useShop();

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard active tab: 'inventory', 'add-product', 'orders', 'admins', 'database'
  const [activeTab, setActiveTab] = useState('inventory');

  // Search filter for inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [adminDraggedId, setAdminDraggedId] = useState(null);
  const [adminDragOverId, setAdminDragOverId] = useState(null);

  // Add Product form state with Multiple Pictures
  const [newProd, setNewProd] = useState({
    name: '',
    tagline: '',
    category: 'repair-creams',
    volume: '50ml',
    pricePKR: '',
    originalPricePKR: '',
    stock: '50',
    badge: 'New Arrival',
    images: ['/assets/hero_cream.jpg'],
    description: '',
    howToUse: '',
    ingredients: ''
  });
  const [newProdSuccess, setNewProdSuccess] = useState(false);

  // Edit Product modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Add Admin form state
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Store Admin'
  });
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  const [adminErrorMsg, setAdminErrorMsg] = useState('');

  // Self password change state
  const [selfNewPass, setSelfNewPass] = useState('');
  const [selfConfirmPass, setSelfConfirmPass] = useState('');
  const [selfPassSuccess, setSelfPassSuccess] = useState('');
  const [selfPassError, setSelfPassError] = useState('');

  // Supabase settings state
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseAnon, setSupabaseAnon] = useState(() => getSupabaseConfig().anon);
  const [dbTestResult, setDbTestResult] = useState(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Site Customization state
  const [customizeSuccessMsg, setCustomizeSuccessMsg] = useState('');
  const [newReview, setNewReview] = useState({
    name: '',
    city: '',
    product: '',
    rating: 5,
    date: 'Just now',
    text: ''
  });
  const [newReviewSuccess, setNewReviewSuccess] = useState(false);

  // Role helper
  const isSuperAdmin = currentAdminUser?.role === 'Super Admin';

  // Self Password Change Handler
  const handleSelfPasswordChange = (e) => {
    e.preventDefault();
    setSelfPassSuccess('');
    setSelfPassError('');
    if (!selfNewPass || selfNewPass.length < 6) {
      setSelfPassError('New password must be at least 6 characters.');
      return;
    }
    if (selfNewPass !== selfConfirmPass) {
      setSelfPassError('Passwords do not match. Please verify.');
      return;
    }
    updateAdminPassword(selfNewPass);
    setSelfPassSuccess('Your password was updated successfully!');
    setSelfNewPass('');
    setSelfConfirmPass('');
    setTimeout(() => setSelfPassSuccess(''), 4000);
  };

  if (!isAdminOpen) return null;

  // --- Login Handler ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const res = adminLogin(loginInput, passwordInput);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginError('');
    }
  };

  // --- Add Image Slot to New Product Form ---
  const handleAddImageSlot = () => {
    setNewProd((prev) => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleUpdateImageSlot = (idx, value) => {
    setNewProd((prev) => {
      const updated = [...prev.images];
      updated[idx] = value;
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImageSlot = (idx) => {
    setNewProd((prev) => {
      if (prev.images.length <= 1) return prev;
      const updated = prev.images.filter((_, i) => i !== idx);
      return { ...prev, images: updated };
    });
  };

  const handleFileUpload = (e, target = 'new', slotIdx = 0) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (!base64Url) return;

      if (target === 'new') {
        setNewProd((prev) => {
          const updated = [...prev.images];
          updated[slotIdx] = base64Url;
          return { ...prev, images: updated };
        });
      } else if (target === 'edit') {
        setEditFormData((prev) => {
          const updated = [...(prev.images || [])];
          updated[slotIdx] = base64Url;
          return { ...prev, images: updated };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Submit New Product ---
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.pricePKR) {
      alert("Please enter Product Name and Price.");
      return;
    }

    const catObj = CATEGORIES.find((c) => c.id === newProd.category) || CATEGORIES[1];
    const validImages = newProd.images.filter(Boolean);
    const finalImages = validImages.length > 0 ? validImages : ['/assets/hero_cream.jpg'];

    addNewProduct({
      ...newProd,
      categoryName: catObj.name,
      image: finalImages[0],
      images: finalImages
    });

    setNewProdSuccess(true);
    setTimeout(() => {
      setNewProdSuccess(false);
      setActiveTab('inventory');
      setNewProd({
        name: '',
        tagline: '',
        category: 'repair-creams',
        volume: '50ml',
        pricePKR: '',
        originalPricePKR: '',
        stock: '50',
        badge: 'New Arrival',
        images: ['/assets/hero_cream.jpg'],
        description: '',
        howToUse: '',
        ingredients: ''
      });
    }, 1200);
  };

  // --- Edit Product Handlers ---
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const pImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || '/assets/hero_cream.jpg'];
    setEditFormData({
      id: p.id,
      name: p.name || '',
      category: p.category || 'repair-creams',
      categoryName: p.categoryName || '',
      volume: p.volume || '',
      pricePKR: p.pricePKR || '',
      originalPricePKR: p.originalPricePKR || '',
      stock: p.stock !== undefined ? p.stock : 50,
      badge: p.badge || '',
      tagline: p.tagline || '',
      description: p.description || '',
      howToUse: p.howToUse || '',
      ingredients: p.ingredients || '',
      images: pImages
    });
    setEditSuccessMsg('');
  };

  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!editFormData) return;

    const catObj = CATEGORIES.find((c) => c.id === editFormData.category);
    const validImages = (editFormData.images || []).filter(Boolean);
    const finalImages = validImages.length > 0 ? validImages : [editingProduct.image];

    updateProduct({
      ...editFormData,
      categoryName: catObj ? catObj.name : editFormData.categoryName,
      image: finalImages[0],
      images: finalImages
    });

    setEditSuccessMsg('Product details and pictures updated successfully!');
    setTimeout(() => {
      setEditSuccessMsg('');
      setEditingProduct(null);
    }, 900);
  };

  // --- Create Admin Handler ---
  const handleCreateAdminSubmit = (e) => {
    e.preventDefault();
    setAdminErrorMsg('');
    setAdminSuccessMsg('');

    const res = addNewAdmin(newAdminData);
    if (!res.success) {
      setAdminErrorMsg(res.message);
    } else {
      setAdminSuccessMsg(`New admin account created for ${newAdminData.email}!`);
      setNewAdminData({ name: '', email: '', password: '', role: 'Store Manager' });
      setTimeout(() => setAdminSuccessMsg(''), 3000);
    }
  };

  // --- Supabase Config Handler ---
  const handleSaveDbConfig = async (e) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseAnon);
    setDbTestResult({ testing: true, message: 'Testing connection to Supabase cloud...' });

    const res = await testSupabaseConnection(supabaseUrl, supabaseAnon);
    setDbTestResult(res);
  };

  // Filtered inventory
  const filteredProducts = products.filter((p) => {
    const q = inventorySearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.categoryName || '').toLowerCase().includes(q);
  });

  // Filtered orders
  const filteredOrders = recentOrders.filter((ord) => {
    if (orderStatusFilter === 'all') return true;
    return ord.status === orderStatusFilter;
  });

  return (
    <div className="overlay-backdrop modal-overlay" onClick={() => setIsAdminOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: isAdminLoggedIn ? '1060px' : '460px',
          maxHeight: '92vh',
          height: isAdminLoggedIn ? 'min(90vh, 880px)' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          transition: 'max-width 0.3s ease',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* 1. Login View */}
        {!isAdminLoggedIn ? (
          <div className="modal-scroll-body" style={{ flex: 1, overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(18, 18, 18, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FDFBF7', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock style={{ width: '18px', height: '18px', color: '#121212' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Admin & Owner Login</h3>
              </div>
              <button onClick={() => setIsAdminOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                <img
                  src="/assets/logo.png"
                  alt="Ayaana's"
                  style={{ width: '54px', height: '54px', borderRadius: '50%', margin: '0 auto 10px auto', border: '2px solid rgba(226, 130, 159, 0.4)' }}
                />
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#121212', margin: '0 0 4px 0' }}>Admin & Owner Login</h2>
                <p style={{ fontSize: '12px', color: '#736C65', margin: 0 }}>
                  Enter your registered credentials to access store operations.
                </p>
              </div>

              {loginError && (
                <div style={{ backgroundColor: '#FDE8ED', border: '1px solid #E2829F', color: '#C75678', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.4 }}>
                  {loginError}
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '6px' }}>
                  Admin Email / Username
                </label>
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Enter your registered email"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(18, 18, 18, 0.15)',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '11px 42px 11px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(18, 18, 18, 0.15)',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#736C65' }}
                  >
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '13.5px', marginTop: '4px' }}
              >
                <Unlock style={{ width: '15px', height: '15px' }} />
                <span>Log In</span>
              </button>
            </form>
          </div>
        ) : (
          /* 2. Authenticated Admin Dashboard */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, flex: 1, overflow: 'hidden' }}>
            {/* Top Bar */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(18, 18, 18, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FDFBF7', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/assets/logo.png" alt="Ayaana's" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid rgba(226, 130, 159, 0.5)' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#121212', margin: 0 }}>
                      {isSuperAdmin ? 'Ayaana’s Super Admin Portal' : 'Ayaana’s Store Admin Portal'}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      background: isSuperAdmin ? '#FDE8ED' : '#D2F4EA',
                      color: isSuperAdmin ? '#C75678' : '#0F5132',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{isSuperAdmin ? '👑 Super Admin' : '👩‍💼 Store Admin'}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#736C65' }}>
                    Logged in as: <strong>{currentAdminUser?.name ? `${currentAdminUser.name} (${currentAdminUser.email})` : (currentAdminUser?.email || 'Syedaayaana20@gmail.com')}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={adminLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#F2ECE4',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#C75678',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut style={{ width: '14px', height: '14px' }} />
                  <span>Logout</span>
                </button>

                <button onClick={() => setIsAdminOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {/* Dashboard Tabs Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(18, 18, 18, 0.08)', backgroundColor: '#FFFFFF', padding: '0 20px', overflowX: 'auto', flexShrink: 0 }}>
              <button
                onClick={() => setActiveTab('inventory')}
                style={{
                  padding: '13px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'inventory' ? '#121212' : '#736C65',
                  borderBottom: activeTab === 'inventory' ? '2.5px solid #121212' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Package style={{ width: '15px', height: '15px' }} />
                <span>Products & Inventory ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('add-product')}
                style={{
                  padding: '13px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'add-product' ? '#121212' : '#736C65',
                  borderBottom: activeTab === 'add-product' ? '2.5px solid #121212' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus style={{ width: '15px', height: '15px', color: '#C75678' }} />
                <span>+ Add Product (Multi-Pictures)</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  padding: '13px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'orders' ? '#121212' : '#736C65',
                  borderBottom: activeTab === 'orders' ? '2.5px solid #121212' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <ShoppingBag style={{ width: '15px', height: '15px' }} />
                <span>Orders ({recentOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('admins')}
                style={{
                  padding: '13px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'admins' ? '#121212' : '#736C65',
                  borderBottom: activeTab === 'admins' ? '2.5px solid #121212' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Users style={{ width: '15px', height: '15px' }} />
                <span>{isSuperAdmin ? `Team & Admins (${adminsList.length})` : 'Profile & Team'}</span>
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('database')}
                  style={{
                    padding: '13px 16px',
                    border: 'none',
                    background: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: activeTab === 'database' ? '#121212' : '#736C65',
                    borderBottom: activeTab === 'database' ? '2.5px solid #121212' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Database style={{ width: '15px', height: '15px' }} />
                  <span>Database & Supabase</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('customize')}
                style={{
                  padding: '13px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeTab === 'customize' ? '#C75678' : '#736C65',
                  borderBottom: activeTab === 'customize' ? '2.5px solid #C75678' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Settings2 style={{ width: '15px', height: '15px' }} />
                <span>&#10024; Site Customization</span>
              </button>
            </div>

            {/* Dashboard Scrollable Body */}
            <div className="modal-scroll-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px' }}>
              
              {/* TAB 1: Products & Inventory */}
              {activeTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#736C65' }} />
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Search products..."
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '12.5px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Reset catalog to official default products? Any deleted original products will be restored.")) {
                            resetProductsToDefault();
                          }
                        }}
                        style={{
                          padding: '8px 13px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '8px',
                          border: '1px solid rgba(18,18,18,0.15)',
                          background: '#FFFFFF',
                          color: '#736C65',
                          cursor: 'pointer'
                        }}
                        title="Restore all official default products"
                      >
                        Reset Defaults
                      </button>

                      <button
                        onClick={() => setActiveTab('add-product')}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12.5px' }}
                      >
                        <Plus style={{ width: '14px', height: '14px' }} />
                        <span>Add New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Products Table with Drag & Drop Reordering */}
                  <div style={{ background: '#FAF7F2', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GripVertical style={{ width: '16px', height: '16px', color: '#128C7E' }} />
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#121212' }}>
                        Product Display Order: Rows ko drag karein ya "⭐ Make #1" click karein taake product pehle show ho!
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#736C65', fontWeight: 600 }}>
                      Top row is #1 on store homepage
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '8px' }}>
                    <div style={{ minWidth: '720px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '70px 60px 2fr 1.1fr 1fr 1fr 180px', gap: '12px', fontSize: '11px', fontWeight: 800, color: '#736C65', textTransform: 'uppercase', padding: '0 12px' }}>
                        <span>Order</span>
                        <span>Photo</span>
                        <span>Product Title</span>
                        <span>Category</span>
                        <span>Price</span>
                        <span>Stock</span>
                        <span>Actions</span>
                      </div>

                      {filteredProducts.map((p) => {
                        const productGlobalIndex = products.findIndex((item) => item.id === p.id);
                        const isFirst = productGlobalIndex === 0;
                        const imgCount = Array.isArray(p.images) ? p.images.length : 1;

                        return (
                          <div
                            key={p.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', p.id);
                              e.dataTransfer.effectAllowed = 'move';
                              setAdminDraggedId(p.id);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (adminDragOverId !== p.id) setAdminDragOverId(p.id);
                            }}
                            onDragLeave={() => {
                              if (adminDragOverId === p.id) setAdminDragOverId(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const sourceId = e.dataTransfer.getData('text/plain') || adminDraggedId;
                              if (sourceId && sourceId !== p.id) {
                                const fromIdx = products.findIndex((item) => item.id === sourceId);
                                const toIdx = products.findIndex((item) => item.id === p.id);
                                if (fromIdx !== -1 && toIdx !== -1) {
                                  moveProduct(fromIdx, toIdx);
                                }
                              }
                              setAdminDraggedId(null);
                              setAdminDragOverId(null);
                            }}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '70px 60px 2fr 1.1fr 1fr 1fr 180px',
                              gap: '12px',
                              alignItems: 'center',
                              padding: '12px',
                              borderRadius: '12px',
                              backgroundColor: 'var(--bg-surface)',
                              border: isFirst ? '1.5px solid #128C7E' : '1px solid var(--border-card)',
                              opacity: adminDraggedId === p.id ? 0.4 : 1,
                              transform: adminDragOverId === p.id ? 'scale(1.015)' : 'none',
                              boxShadow: adminDragOverId === p.id ? '0 0 0 2px #128C7E' : 'none',
                              transition: 'transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease'
                            }}
                          >
                            {/* Order & Drag Handle */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{ cursor: 'grab', padding: '4px 2px', color: '#9B948C' }}
                                title="Drag to reorder position"
                              >
                                <GripVertical style={{ width: '16px', height: '16px' }} />
                              </div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  background: isFirst ? '#128C7E' : '#F2ECE4',
                                  color: isFirst ? '#FFFFFF' : '#121212'
                                }}
                              >
                                #{productGlobalIndex + 1}
                              </span>
                            </div>

                            {/* Photo */}
                            <div style={{ position: 'relative' }}>
                              <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                              {imgCount > 1 && (
                                <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#121212', color: '#FFFFFF', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                                  {imgCount}📷
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#121212' }}>{p.name}</div>
                              <div style={{ fontSize: '11px', color: '#736C65' }}>{p.volume} • {p.badge || 'Standard'}</div>
                            </div>

                            {/* Category */}
                            <div>
                              <span style={{ fontSize: '12px', background: '#F2ECE4', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                {p.categoryName}
                              </span>
                            </div>

                            {/* Price */}
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '13px', color: '#121212' }}>
                                Rs. {Number(p.pricePKR).toLocaleString()}
                              </span>
                            </div>

                            {/* Stock */}
                            <div>
                              <span style={{ fontSize: '12.5px', fontWeight: 600, color: p.stock < 30 ? '#C75678' : '#128C7E' }}>
                                {p.stock} in stock
                              </span>
                            </div>

                            {/* Actions & Make #1 Button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {!isFirst ? (
                                <button
                                  type="button"
                                  onClick={() => moveProductToFirst(p.id)}
                                  style={{
                                    background: '#FAF0E6',
                                    color: '#8A5836',
                                    border: '1px solid #D6A685',
                                    borderRadius: '6px',
                                    padding: '5px 8px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Bring this product to 1st place on store homepage"
                                >
                                  <Star style={{ width: '12px', height: '12px', fill: '#D6A685' }} />
                                  <span>Make #1</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '10.5px', background: '#D2F4EA', color: '#0F5132', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                  ★ Active #1
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                style={{
                                  background: '#121212',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 9px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Edit3 style={{ width: '12px', height: '12px' }} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to permanently delete "${p.name}"?\n\nThis product will be removed completely from your store and will not reappear.`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#C53030',
                                  cursor: 'pointer',
                                  padding: '5px 7px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'background 0.2s'
                                }}
                                title="Delete product permanently"
                              >
                                <Trash2 style={{ width: '15px', height: '15px' }} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Add New Product Form (With Multiple Pictures) */}
              {activeTab === 'add-product' && (
                <form onSubmit={handleAddProductSubmit} style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Add New Product with Multiple Pictures</h3>
                    <p style={{ fontSize: '12.5px', color: '#736C65', marginTop: '4px' }}>
                      Upload multiple pictures, set pricing in PKR, stock, and descriptions.
                    </p>
                  </div>

                  {newProdSuccess && (
                    <div style={{ background: '#D2F4EA', color: '#0F5132', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Check style={{ width: '18px', height: '18px' }} />
                      <span>Product successfully published to store!</span>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                      Product Title / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProd.name}
                      onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                      placeholder="e.g. Ayaana's 24K Gold Saffron Radiance Elixir"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Category *
                      </label>
                      <select
                        value={newProd.category}
                        onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                      >
                        {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Volume / Size
                      </label>
                      <input
                        type="text"
                        value={newProd.volume}
                        onChange={(e) => setNewProd({ ...newProd, volume: e.target.value })}
                        placeholder="e.g. 50ml, 120ml, 250ml"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Price (PKR) *
                      </label>
                      <input
                        type="number"
                        required
                        value={newProd.pricePKR}
                        onChange={(e) => setNewProd({ ...newProd, pricePKR: e.target.value })}
                        placeholder="e.g. 1950"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Compare Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={newProd.originalPricePKR}
                        onChange={(e) => setNewProd({ ...newProd, originalPricePKR: e.target.value })}
                        placeholder="e.g. 2400"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        value={newProd.stock}
                        onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                      Badge
                    </label>
                    <select
                      value={newProd.badge}
                      onChange={(e) => setNewProd({ ...newProd, badge: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="New Arrival">New Arrival</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Top Rated">Top Rated</option>
                      <option value="100% Herbal">100% Herbal</option>
                      <option value="Organic Certified">Organic Certified</option>
                      <option value="Limited Edition">Limited Edition</option>
                    </select>
                  </div>

                  {/* MULTIPLE PICTURES BUILDER */}
                  <div style={{ background: '#FAF7F2', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#121212' }}>Product Pictures ({newProd.images.length})</span>
                        <p style={{ fontSize: '11.5px', color: '#736C65', margin: '2px 0 0 0' }}>
                          Add multiple images. The first picture will be the primary store card image.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImageSlot}
                        style={{ background: '#121212', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus style={{ width: '13px', height: '13px' }} />
                        <span>Add Another Picture</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {newProd.images.map((imgUrl, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.1)' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: idx === 0 ? '#128C7E' : '#736C65', width: '56px' }}>
                            {idx === 0 ? 'Cover #' + (idx + 1) : 'Photo #' + (idx + 1)}
                          </span>

                          {imgUrl ? (
                            <img src={imgUrl} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#F2ECE4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Image style={{ width: '18px', height: '18px', color: '#736C65' }} />
                            </div>
                          )}

                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => handleUpdateImageSlot(idx, e.target.value)}
                            placeholder="Image URL or choose file below..."
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '12px', outline: 'none' }}
                          />

                          <label style={{ cursor: 'pointer', background: '#F2ECE4', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UploadCloud style={{ width: '13px', height: '13px' }} />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'new', idx)}
                              style={{ display: 'none' }}
                            />
                          </label>

                          {newProd.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImageSlot(idx)}
                              style={{ background: 'none', border: 'none', color: '#C75678', cursor: 'pointer', padding: '4px' }}
                              title="Remove picture slot"
                            >
                              <X style={{ width: '16px', height: '16px' }} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                      Short Tagline / Benefits
                    </label>
                    <input
                      type="text"
                      value={newProd.tagline}
                      onChange={(e) => setNewProd({ ...newProd, tagline: e.target.value })}
                      placeholder="e.g. Deep skin repair & luminous brightener"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                      Detailed Description & Ingredients
                    </label>
                    <textarea
                      rows={3}
                      value={newProd.description}
                      onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                      placeholder="Crafted with pure organic extracts for youthful glow..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', padding: '13px', fontSize: '14px' }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    <span>Publish Product to Store</span>
                  </button>
                </form>
              )}

              {/* TAB 3: Orders Received */}
              {activeTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['all', 'Processing Order', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setOrderStatusFilter(status)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: orderStatusFilter === status ? '#121212' : 'rgba(18,18,18,0.15)',
                            background: orderStatusFilter === status ? '#121212' : '#FFFFFF',
                            color: orderStatusFilter === status ? '#FFFFFF' : '#736C65',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {status === 'all' ? `All Orders (${recentOrders.length})` : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#736C65', fontSize: '13px' }}>
                      No orders found under this filter.
                    </div>
                  ) : (
                    filteredOrders.map((ord) => (
                      <div
                        key={ord.orderId}
                        style={{
                          padding: '18px',
                          borderRadius: '16px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-card)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: '15px' }}>Order #{ord.orderId}</span>
                            <span style={{ fontSize: '11px', color: '#736C65', marginLeft: '8px' }}>Date: {ord.date}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#736C65' }}>Status:</span>
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.orderId, e.target.value)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(18,18,18,0.15)',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: '#FFFFFF',
                                color: ord.status === 'Delivered' ? '#0F5132' : (ord.status === 'In Transit' ? '#084298' : '#664D03')
                              }}
                            >
                              <option value="Processing Order">Processing Order</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: '#2E2B28' }}>
                          <strong>Customer:</strong> {ord.customerName} ({ord.phone}) • <strong>City:</strong> {ord.city} • <strong>Address:</strong> {ord.address}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(18,18,18,0.06)' }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#121212' }}>
                            Total: {formatPrice(ord.total, ord.total)} ({ord.paymentMethod})
                          </div>

                          {ord.phone && (
                            <a
                              href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${ord.customerName}! This is Ayaana's Skincare regarding your order #${ord.orderId}. Your order is currently ${ord.status}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-whatsapp"
                              style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}
                            >
                              <MessageCircle style={{ width: '14px', height: '14px' }} />
                              <span>Message Customer</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: Team & Admins (Profile & Directory) */}
              {activeTab === 'admins' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto' }}>
                  {/* Active Admin Profile Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #FAF7F2 0%, #FFFFFF 100%)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1.5px solid rgba(226, 130, 159, 0.35)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: isSuperAdmin ? 'linear-gradient(135deg, #121212 0%, #C75678 100%)' : 'linear-gradient(135deg, #0F5132 0%, #128C7E 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '20px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          {currentAdminUser?.name ? currentAdminUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SA'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#121212' }}>
                              {currentAdminUser?.name || 'Syeda Ayaana'}
                            </h3>
                            <span style={{
                              fontSize: '11px',
                              background: isSuperAdmin ? '#FDE8ED' : '#D2F4EA',
                              color: isSuperAdmin ? '#C75678' : '#0F5132',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 800
                            }}>
                              {isSuperAdmin ? '👑 Super Admin' : '👩‍💼 Store Admin'}
                            </span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#736C65', marginTop: '2px' }}>
                            {currentAdminUser?.email || 'Syedaayaana20@gmail.com'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F5132', background: '#D2F4EA', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check style={{ width: '13px', height: '13px' }} />
                          <span>Active Administrator</span>
                        </span>
                      </div>
                    </div>

                    {/* Permissions summary */}
                    <div style={{ borderTop: '1px solid rgba(18,18,18,0.06)', paddingTop: '14px', marginTop: '10px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#121212', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                        Your Granted Permissions:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#0F5132', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check style={{ width: '14px', height: '14px' }} />
                          <span>Products & Catalog Management</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#0F5132', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check style={{ width: '14px', height: '14px' }} />
                          <span>Multi-Picture Image Uploads</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#0F5132', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check style={{ width: '14px', height: '14px' }} />
                          <span>Customer Orders & Status Tracking</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#0F5132', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check style={{ width: '14px', height: '14px' }} />
                          <span>Store Testimonials & Reviews</span>
                        </div>
                        <div style={{ fontSize: '12px', color: isSuperAdmin ? '#0F5132' : '#736C65', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isSuperAdmin ? <Check style={{ width: '14px', height: '14px' }} /> : <Lock style={{ width: '13px', height: '13px', color: '#C75678' }} />}
                          <span>{isSuperAdmin ? 'Full Admin Account Management' : 'Admin Creation (Super Admin Only)'}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: isSuperAdmin ? '#0F5132' : '#736C65', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isSuperAdmin ? <Check style={{ width: '14px', height: '14px' }} /> : <Lock style={{ width: '13px', height: '13px', color: '#C75678' }} />}
                          <span>{isSuperAdmin ? 'Direct Cloud Database Control' : 'Cloud Database (Super Admin Only)'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change My Password Box */}
                  <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Key style={{ width: '16px', height: '16px', color: '#C75678' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#121212' }}>
                        Update My Password
                      </h4>
                    </div>
                    <p style={{ fontSize: '12px', color: '#736C65', margin: '0 0 14px 0' }}>
                      Update the password for your current account (<strong>{currentAdminUser?.email || 'Syedaayaana20@gmail.com'}</strong>).
                    </p>

                    {selfPassSuccess && (
                      <div style={{ background: '#D2F4EA', color: '#0F5132', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, marginBottom: '12px' }}>
                        ✓ {selfPassSuccess}
                      </div>
                    )}
                    {selfPassError && (
                      <div style={{ background: '#FDE8ED', color: '#C75678', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, marginBottom: '12px' }}>
                        {selfPassError}
                      </div>
                    )}

                    <form onSubmit={handleSelfPasswordChange} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>New Password</label>
                        <input
                          type="password"
                          required
                          value={selfNewPass}
                          onChange={(e) => setSelfNewPass(e.target.value)}
                          placeholder="Enter new password"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={selfConfirmPass}
                          onChange={(e) => setSelfConfirmPass(e.target.value)}
                          placeholder="Re-type new password"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px', outline: 'none' }}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ padding: '9px 18px', fontSize: '12.5px' }}
                        >
                          <Save style={{ width: '13px', height: '13px' }} />
                          <span>Save New Password</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* If Super Admin, show Create New Admin Form. If Store Admin, show informative badge */}
                  {isSuperAdmin ? (
                    <div style={{ background: '#FAF7F2', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-card)' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px 0', color: '#121212' }}>
                        Create New Admin Account
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#736C65', margin: '0 0 16px 0' }}>
                        Add colleagues or managers to manage store inventory, pictures, and orders.
                      </p>

                      {adminSuccessMsg && (
                        <div style={{ background: '#D2F4EA', color: '#0F5132', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, marginBottom: '12px' }}>
                          ✓ {adminSuccessMsg}
                        </div>
                      )}
                      {adminErrorMsg && (
                        <div style={{ background: '#FDE8ED', color: '#C75678', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, marginBottom: '12px' }}>
                          {adminErrorMsg}
                        </div>
                      )}

                      <form onSubmit={handleCreateAdminSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>Full Name</label>
                          <input
                            type="text"
                            required
                            value={newAdminData.name}
                            onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                            placeholder="e.g. Ali Khan"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>Admin Email *</label>
                          <input
                            type="email"
                            required
                            value={newAdminData.email}
                            onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                            placeholder="e.g. ali@ayaanas.com"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>Password *</label>
                          <input
                            type="password"
                            required
                            value={newAdminData.password}
                            onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                            placeholder="Create strong password"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>Role</label>
                          <select
                            value={newAdminData.role}
                            onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px', outline: 'none', backgroundColor: '#FFFFFF' }}
                          >
                            <option value="Super Admin">Super Admin (Full Access)</option>
                            <option value="Store Admin">Store Admin (Products & Orders)</option>
                            <option value="Order Dispatcher">Order Dispatcher (Orders Only)</option>
                          </select>
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', padding: '11px', fontSize: '13px' }}
                          >
                            <Plus style={{ width: '14px', height: '14px' }} />
                            <span>Add Admin Account</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div style={{ background: '#F8F4EE', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(18,18,18,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ShieldCheck style={{ width: '22px', height: '22px', color: '#0F5132', flexShrink: 0 }} />
                      <div style={{ fontSize: '12.5px', color: '#444', lineHeight: 1.5 }}>
                        <strong>Store Admin Access:</strong> You have full control over the store catalog, multiple pictures, inventory, prices, and orders. Adding or deleting administrator accounts is handled by the Super Admin.
                      </div>
                    </div>
                  )}

                  {/* Registered Admins List */}
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 12px 0' }}>
                      Active Store Administrators ({adminsList.length})
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {adminsList.map((adm) => {
                        const isSelf = currentAdminUser?.email?.toLowerCase() === adm.email.toLowerCase();
                        return (
                          <div
                            key={adm.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 18px',
                              borderRadius: '12px',
                              backgroundColor: 'var(--bg-surface)',
                              border: '1px solid var(--border-card)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: adm.role === 'Super Admin' ? '#121212' : '#0F5132',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '14px'
                              }}>
                                {adm.name?.charAt(0).toUpperCase() || 'A'}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#121212', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>{adm.name}</span>
                                  {isSelf && (
                                    <span style={{ fontSize: '10px', background: '#D2F4EA', color: '#0F5132', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                      You (Current)
                                    </span>
                                  )}
                                  <span style={{
                                    fontSize: '10px',
                                    background: adm.role === 'Super Admin' ? '#FDE8ED' : '#E8F5E9',
                                    color: adm.role === 'Super Admin' ? '#C75678' : '#2E7D32',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700
                                  }}>
                                    {adm.role}
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#736C65' }}>{adm.email}</div>
                              </div>
                            </div>

                            {isSuperAdmin && !isSelf && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove admin account for ${adm.email}?`)) {
                                    deleteAdmin(adm.id);
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: '#C75678', cursor: 'pointer', padding: '6px' }}
                                title="Remove admin"
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Database & Supabase Settings */}
              {activeTab === 'database' && (
                !isSuperAdmin ? (
                  <div style={{ maxWidth: '560px', margin: '30px auto', textAlign: 'center', background: '#FAF7F2', padding: '36px 24px', borderRadius: '16px', border: '1px solid var(--border-card)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FDE8ED', color: '#C75678', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                      <Lock style={{ width: '26px', height: '26px' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#121212', margin: '0 0 8px 0' }}>Super Admin Access Required</h3>
                    <p style={{ fontSize: '13px', color: '#736C65', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                      Direct cloud database configuration and SQL schema management are reserved for the Super Admin. As a Store Admin, you have full access to manage Products, Multi-Picture Catalog, Stock, and Customer Orders.
                    </p>
                    <button onClick={() => setActiveTab('inventory')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                      Go to Products & Inventory
                    </button>
                  </div>
                ) : (
                <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0', color: '#121212' }}>
                      Database & Supabase Cloud Integration
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#736C65', margin: 0, lineHeight: 1.5 }}>
                      Supabase is the <strong>#1 best choice</strong> for Ayaana's Skincare. It gives you a free cloud PostgreSQL database, instant authentication, and storage for multiple product photos.
                    </p>
                  </div>

                  {/* Why Supabase Explanation Card */}
                  <div style={{ background: '#F8F4EE', padding: '16px', borderRadius: '12px', border: '1px solid rgba(18,18,18,0.08)', fontSize: '12.5px', color: '#444' }}>
                    <div style={{ fontWeight: 800, color: '#121212', marginBottom: '6px' }}>
                      💡 Login & Product Save Kaise Hote Hain? (Supabase vs LocalStorage)
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                      <li><strong>Abhi:</strong> Aap ka system persistent <code>localStorage</code> use kr rha hai (browser aur local system me foran save hota hai).</li>
                      <li><strong>Supabase:</strong> Free cloud database hai. Jab aap niche Supabase URL aur Anon Key dalenge, har new admin, product aur multiple photos cloud database me sync ho jynge.</li>
                      <li><strong>SQL Schema:</strong> Aap k project me <code>supabase_schema.sql</code> file tayar hai jise Supabase SQL Editor me 1-click run kr sakte hain.</li>
                    </ul>
                  </div>

                  {/* Supabase Config Form */}
                  <form onSubmit={handleSaveDbConfig} style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, margin: 0 }}>
                      Connect Your Supabase Project
                    </h4>

                    {dbTestResult && (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        background: dbTestResult.success ? '#D2F4EA' : '#FDE8ED',
                        color: dbTestResult.success ? '#0F5132' : '#C75678'
                      }}>
                        {dbTestResult.message}
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://xyzproject.supabase.co"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Supabase Anon Public Key
                      </label>
                      <input
                        type="text"
                        value={supabaseAnon}
                        onChange={(e) => setSupabaseAnon(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '10px 20px', fontSize: '13px' }}
                      >
                        <Database style={{ width: '14px', height: '14px' }} />
                        <span>Save & Test Supabase Cloud Connection</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSqlSchema(!showSqlSchema)}
                        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.2)', background: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {showSqlSchema ? 'Hide SQL Script' : 'View SQL Schema Script'}
                      </button>
                    </div>

                    {showSqlSchema && (
                      <div style={{ marginTop: '10px', background: '#121212', color: '#A3E635', padding: '14px', borderRadius: '10px', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '200px' }}>
                        <pre style={{ margin: 0 }}>
{`-- Create tables in Supabase SQL Editor:
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'Store Manager'
);

CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_pkr NUMERIC NOT NULL,
    stock INTEGER DEFAULT 50,
    image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT
);

CREATE TABLE public.orders (
    order_id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'Processing Order'
);`}
                        </pre>
                      </div>
                    )}
                  </form>
                </div>
                )
              )}

              {/* TAB 6: Site Customization */}
              {activeTab === 'customize' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {customizeSuccessMsg && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check style={{ width: '16px', height: '16px', color: '#10B981' }} />
                      <span>{customizeSuccessMsg}</span>
                    </div>
                  )}

                  {/* 1. Hero Section Product & 3D Model */}
                  <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ background: '#FAF0F3', padding: '8px', borderRadius: '8px', color: '#C75678' }}>
                        <Layout style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#121212' }}>
                          1. Hero Section: Product &amp; 3D Model
                        </h3>
                        <p style={{ fontSize: '12px', color: '#736C65', margin: 0 }}>
                          Select which product is highlighted in the hero card, its 3D model, and floating ingredient badges.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      {/* Product Selector */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '6px' }}>
                          Featured Product
                        </label>
                        <select
                          value={heroSettings?.heroProductId || ''}
                          onChange={(e) => {
                            updateHeroSettings({ heroProductId: e.target.value || null });
                            setCustomizeSuccessMsg('Hero product updated!');
                            const newProdId = e.target.value || null;
                            const selectedProd = products.find(p => p.id === newProdId);
                            const prodName = (selectedProd?.name || '').toLowerCase();

                            let autoModel = 'hand-feet-cream';
                            if (newProdId === 'natural-glow-mask' || newProdId?.includes('mask') || prodName.includes('mask')) {
                              autoModel = 'natural-glow-mask';
                            } else if (newProdId === 'whitening-toner' || newProdId?.includes('toner') || prodName.includes('toner')) {
                              autoModel = 'toner';
                            } else if (newProdId === 'face-whitening-cream' || prodName.includes('face')) {
                              autoModel = 'face-whitening-cream';
                            } else if (newProdId === 'hand-and-feet-whitening-cream' || prodName.includes('hand') || prodName.includes('feet')) {
                              autoModel = 'hand-feet-cream';
                            }

                            updateHeroSettings({ heroProductId: newProdId, heroModelType: autoModel });
                            setCustomizeSuccessMsg('Hero product & 3D model updated!');
                            setTimeout(() => setCustomizeSuccessMsg(''), 3000);
                          }}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                        >
                          <option value="">Default (Hand &amp; Feet Whitening Cream)</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {formatPrice(p.pricePKR, p.priceUSD)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3D Model Selector */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '6px' }}>
                          Hero 3D Model
                        </label>
                        <select
                          value={heroSettings?.heroModelType || 'hand-feet-cream'}
                          onChange={(e) => {
                            updateHeroSettings({ heroModelType: e.target.value });
                            setCustomizeSuccessMsg('Hero 3D model updated!');
                            setTimeout(() => setCustomizeSuccessMsg(''), 3000);
                          }}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                        >
                          <option value="natural-glow-mask">✨ Natural Glow Mask (3D Luxury Porcelain Tub)</option>
                          <option value="toner">🌸 Whitening Toner (3D Spray Mist Bottle)</option>
                          <option value="face-whitening-cream">✨ Face Whitening Cream (3D Luxury Jar)</option>
                          <option value="hand-feet-cream">🧴 Hand &amp; Feet Whitening Cream (3D Jar with Open Lid)</option>
                        </select>
                      </div>
                    </div>

                    {/* Floating Badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#736C65', display: 'block', marginBottom: '4px' }}>
                          Floating Badge 1 Text
                        </label>
                        <input
                          type="text"
                          value={heroSettings?.heroBadge1 || ''}
                          onChange={(e) => updateHeroSettings({ heroBadge1: e.target.value })}
                          placeholder="✦ 100% Herbal Brightening"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#736C65', display: 'block', marginBottom: '4px' }}>
                          Floating Badge 2 Text
                        </label>
                        <input
                          type="text"
                          value={heroSettings?.heroBadge2 || ''}
                          onChange={(e) => updateHeroSettings({ heroBadge2: e.target.value })}
                          placeholder="✦ Deep Velvet Moisture"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12.5px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Girl's Image / Living Model Routine Products */}
                  <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#FAF0F3', padding: '8px', borderRadius: '8px', color: '#C75678' }}>
                          <Users style={{ width: '18px', height: '18px' }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#121212' }}>
                            2. Girl's Image: Click-to-Shop Products
                          </h3>
                          <p style={{ fontSize: '12px', color: '#736C65', margin: 0 }}>
                            Select which products are shown when visitors click on the 3D model girl in the hero section.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => updatePortraitProductIds(products.map(p => p.id))}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.15)', background: '#FAF7F2', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePortraitProductIds([])}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.15)', background: '#FAF7F2', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px', marginTop: '16px' }}>
                      {products.map((prod) => {
                        const isSelected = (portraitProductIds || []).includes(prod.id);
                        return (
                          <div
                            key={prod.id}
                            onClick={() => {
                              const updated = isSelected
                                ? (portraitProductIds || []).filter(id => id !== prod.id)
                                : [...(portraitProductIds || []), prod.id];
                              updatePortraitProductIds(updated);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #C75678' : '1px solid rgba(18,18,18,0.12)',
                              backgroundColor: isSelected ? '#FAF0F3' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ width: '16px', height: '16px', accentColor: '#C75678', cursor: 'pointer' }}
                            />
                            <img
                              src={prod.image || prod.images?.[0]}
                              alt={prod.name}
                              style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#121212', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prod.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#C75678', fontWeight: 700 }}>
                                {formatPrice(prod.pricePKR, prod.priceUSD)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#736C65', fontWeight: 600 }}>
                      ✓ {(portraitProductIds || []).length} products linked to Model's Routine
                    </div>
                  </div>

                  {/* 3. Transformation Section 3D Product */}
                  <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ background: '#FAF0F3', padding: '8px', borderRadius: '8px', color: '#C75678' }}>
                        <Sliders style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#121212' }}>
                          3. Transformation Section (7-Day Radiance): 3D Model Selection
                        </h3>
                        <p style={{ fontSize: '12px', color: '#736C65', margin: 0 }}>
                          Select which 3D model and linked product is displayed below "See The Transformation: 7-Day Radiance Renewal".
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '6px' }}>
                          Select 3D Model (from available 3D assets)
                        </label>
                        <select
                          value={transformationModel?.modelType || 'hand-feet-cream'}
                          onChange={(e) => {
                            updateTransformationModel({ modelType: e.target.value });
                            setCustomizeSuccessMsg('Transformation 3D model updated!');
                            setTimeout(() => setCustomizeSuccessMsg(''), 3000);
                          }}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                        >
                          <option value="natural-glow-mask">✨ Natural Glow Mask (3D Luxury Porcelain Tub)</option>
                          <option value="toner">🌸 Whitening Toner (3D Spray Mist Bottle)</option>
                          <option value="face-whitening-cream">✨ Face Whitening Cream (3D Luxury Jar)</option>
                          <option value="hand-feet-cream">🧴 Hand and Feet Whitening Cream (3D Jar with open lid)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '6px' }}>
                          Linked Store Product (Shows name, price &amp; View button)
                        </label>
                        <select
                          value={transformationModel?.productId || ''}
                          onChange={(e) => {
                            updateTransformationModel({ productId: e.target.value || null });
                            setCustomizeSuccessMsg('Transformation linked product updated!');
                            setTimeout(() => setCustomizeSuccessMsg(''), 3000);
                          }}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                        >
                          <option value="">None (3D Model only)</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {formatPrice(p.pricePKR, p.priceUSD)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 4. Customer Reviews Section Manager (Add Multiple Custom Reviews) */}
                  <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-card)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#FAF0F3', padding: '8px', borderRadius: '8px', color: '#C75678' }}>
                          <Star style={{ width: '18px', height: '18px' }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#121212' }}>
                            4. Customer Reviews Manager (Add Multiple Reviews)
                          </h3>
                          <p style={{ fontSize: '12px', color: '#736C65', margin: 0 }}>
                            Add your own custom reviews with custom names, Pakistani cities, products, star ratings, and real feedback.
                          </p>
                        </div>
                      </div>

                      <span style={{ fontSize: '12px', background: '#FAF0F3', color: '#C75678', padding: '4px 12px', borderRadius: '9999px', fontWeight: 800 }}>
                        {(siteReviews || []).length} Total Reviews
                      </span>
                    </div>

                    {/* Add Review Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newReview.name || !newReview.text) {
                          alert('Please enter reviewer name and feedback text.');
                          return;
                        }
                        addReview({
                          ...newReview,
                          product: newReview.product || (products[0]?.name || 'Face Whitening Cream')
                        });
                        setNewReview({
                          name: '',
                          city: '',
                          product: '',
                          rating: 5,
                          date: 'Just now',
                          text: ''
                        });
                        setNewReviewSuccess(true);
                        setTimeout(() => setNewReviewSuccess(false), 3000);
                      }}
                      style={{ background: '#FAF7F2', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-card)', marginTop: '14px' }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: '#121212' }}>
                        + Add a New Review to the Website
                      </div>

                      {newReviewSuccess && (
                        <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check style={{ width: '14px', height: '14px' }} />
                          <span>Review added successfully! It is now live on the site.</span>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '3px' }}>
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Maria Khan"
                            value={newReview.name}
                            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '3px' }}>
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Lahore, Karachi, Islamabad"
                            value={newReview.city}
                            onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '3px' }}>
                            Product
                          </label>
                          <select
                            value={newReview.product}
                            onChange={(e) => setNewReview({ ...newReview, product: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                          >
                            <option value="">Select a Product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '3px' }}>
                            Rating (Stars)
                          </label>
                          <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                            <option value={3}>⭐⭐⭐ (3 Stars)</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '3px' }}>
                            Date / Timeline
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2 days ago"
                            value={newReview.date}
                            onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12px' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '3px' }}>
                          Review Feedback / Comment *
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Write the customer's review in Urdu or English..."
                          value={newReview.text}
                          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '12px', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Plus style={{ width: '14px', height: '14px' }} />
                          <span>Add Review to Site</span>
                        </button>
                      </div>
                    </form>

                    {/* Active Reviews List */}
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px', color: '#121212' }}>
                        Current Live Reviews ({(siteReviews || []).length})
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                        {(siteReviews || []).map((rev) => (
                          <div
                            key={rev.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '12px 14px',
                              borderRadius: '10px',
                              backgroundColor: '#FAF7F2',
                              border: '1px solid rgba(18,18,18,0.08)'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#121212' }}>{rev.name}</span>
                                {rev.city && (
                                  <span style={{ fontSize: '11px', color: '#736C65' }}>• {rev.city}</span>
                                )}
                                <span style={{ fontSize: '11px', color: '#D97706' }}>
                                  {'★'.repeat(rev.rating || 5)}
                                </span>
                                {rev.date && (
                                  <span style={{ fontSize: '10.5px', color: '#9CA3AF' }}>({rev.date})</span>
                                )}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#C75678', fontWeight: 700, marginTop: '2px' }}>
                                {rev.product}
                              </div>
                              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                                "{rev.text}"
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete review from ${rev.name}?`)) {
                                  deleteReview(rev.id);
                                }
                              }}
                              style={{
                                background: '#FEE2E2',
                                border: 'none',
                                color: '#DC2626',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                              title="Delete review"
                            >
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-modal: Update Product Details Modal */}
            {editingProduct && editFormData && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(18, 18, 18, 0.45)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1100,
                  padding: '20px'
                }}
                onClick={() => setEditingProduct(null)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '640px',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
                    border: '1px solid var(--border-card)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(18,18,18,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FDFBF7', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={editingProduct.image} alt={editingProduct.name} style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#121212' }}>Update Product & Pictures</h4>
                        <span style={{ fontSize: '11px', color: '#736C65' }}>ID: {editingProduct.id}</span>
                      </div>
                    </div>
                    <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                      <X style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProductEdit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                    {editSuccessMsg && (
                      <div style={{ background: '#D2F4EA', color: '#0F5132', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Check style={{ width: '16px', height: '16px' }} />
                        <span>{editSuccessMsg}</span>
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                          Price (PKR) *
                        </label>
                        <input
                          type="number"
                          required
                          value={editFormData.pricePKR}
                          onChange={(e) => setEditFormData({ ...editFormData, pricePKR: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          value={editFormData.stock}
                          onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                          Category
                        </label>
                        <select
                          value={editFormData.category}
                          onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                        >
                          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                          Volume / Size
                        </label>
                        <input
                          type="text"
                          value={editFormData.volume}
                          onChange={(e) => setEditFormData({ ...editFormData, volume: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Edit Multiple Pictures */}
                    <div style={{ background: '#FAF7F2', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 800 }}>Manage Pictures ({(editFormData.images || []).length})</span>
                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, images: [...(editFormData.images || []), ''] })}
                          style={{ background: '#121212', color: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          + Add Picture Slot
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(editFormData.images || []).map((img, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.1)' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, width: '45px' }}>#{i + 1}</span>
                            <input
                              type="text"
                              value={img}
                              onChange={(e) => {
                                const upd = [...editFormData.images];
                                upd[i] = e.target.value;
                                setEditFormData({ ...editFormData, images: upd });
                              }}
                              placeholder="Image URL"
                              style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(18,18,18,0.15)', fontSize: '12px' }}
                            />
                            <label style={{ cursor: 'pointer', background: '#F2ECE4', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'edit', i)}
                                style={{ display: 'none' }}
                              />
                            </label>
                            {editFormData.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const upd = editFormData.images.filter((_, idx) => idx !== i);
                                  setEditFormData({ ...editFormData, images: upd });
                                }}
                                style={{ background: 'none', border: 'none', color: '#C75678', cursor: 'pointer' }}
                              >
                                <X style={{ width: '15px', height: '15px' }} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={editFormData.tagline}
                        onChange={(e) => setEditFormData({ ...editFormData, tagline: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#121212', display: 'block', marginBottom: '4px' }}>
                        Description & Benefits
                      </label>
                      <textarea
                        rows={3}
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.18)', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(18,18,18,0.08)' }}>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(18,18,18,0.15)', background: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '9px 20px', fontSize: '13px' }}
                      >
                        <Save style={{ width: '14px', height: '14px' }} />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

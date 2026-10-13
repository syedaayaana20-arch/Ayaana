import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, BRAND_CONFIG } from '../data/products';
import { supabaseQuery } from '../lib/supabase';

const ShopContext = createContext();

const DELETED_PRODUCTS_KEY = 'ayaana_deleted_product_ids';

export const DEPRECATED_PRODUCT_IDS = new Set([
  'hand-foot-whitening-repair-complex',
  'miracle-glow-night-balm',
  'triple-hyaluronic-plumping-serum',
  'velvet-saffron-glow-body-treatment',
  'rose-damascena-clarifying-cleanser',
  'herbal-whitening-radiance-toner',
  'radiance-skin-repair-cream'
]);

export function getDeletedProductIds() {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set([...parsed, ...DEPRECATED_PRODUCT_IDS]);
  } catch {
    return new Set(DEPRECATED_PRODUCT_IDS);
  }
}

export function saveDeletedProductIds(setOrArray) {
  try {
    const arr = Array.from(setOrArray);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("Failed to save deleted product IDs:", e);
  }
}

export const mapDbToProduct = (dbProd) => ({
  id: dbProd.id,
  name: dbProd.name,
  tagline: dbProd.tagline || '',
  category: dbProd.category || 'repair-creams',
  categoryName: dbProd.category_name || dbProd.category || 'Whitening & Glow Creams',
  volume: dbProd.volume || '50g',
  pricePKR: Number(dbProd.price_pkr) || 0,
  originalPricePKR: Number(dbProd.original_price_pkr) || Math.round((Number(dbProd.price_pkr) || 0) * 1.2),
  priceUSD: Number(dbProd.price_usd) || Number(((Number(dbProd.price_pkr) || 0) * 0.0036).toFixed(2)),
  originalPriceUSD: Number(((Number(dbProd.price_pkr) || 0) * 0.0036 * 1.2).toFixed(2)),
  stock: dbProd.stock !== undefined ? Number(dbProd.stock) : 50,
  badge: dbProd.badge || '',
  has3D: Boolean(dbProd.has_3d),
  isHero: false,
  image: dbProd.image || '/assets/face_whitening_cream.jpg',
  secondaryImage: (Array.isArray(dbProd.images) && dbProd.images[1]) || dbProd.image || '/assets/face_whitening_cream.jpg',
  images: Array.isArray(dbProd.images) && dbProd.images.length > 0 ? dbProd.images : [dbProd.image || '/assets/face_whitening_cream.jpg'],
  description: dbProd.description || '',
  howToUse: dbProd.how_to_use || '',
  ingredients: dbProd.ingredients || '',
  benefits: Array.isArray(dbProd.benefits) ? dbProd.benefits : [],
  clinicalResults: dbProd.clinical_results || '100% agreed skin felt smoother and brighter.',
  rating: Number(dbProd.rating) || 5.0,
  reviewsCount: Number(dbProd.reviews_count) || 100
});

export const mapProductToDb = (p) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline || '',
  category: p.category || 'repair-creams',
  category_name: p.categoryName || '',
  volume: p.volume || '50g',
  price_pkr: Number(p.pricePKR) || 0,
  original_price_pkr: Number(p.originalPricePKR) || Math.round((Number(p.pricePKR) || 0) * 1.2),
  price_usd: Number(p.priceUSD) || Number(((Number(p.pricePKR) || 0) * 0.0036).toFixed(2)),
  stock: Number(p.stock) !== undefined ? Number(p.stock) : 50,
  badge: p.badge || '',
  image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
  images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image],
  description: p.description || '',
  how_to_use: p.howToUse || '',
  ingredients: p.ingredients || '',
  benefits: Array.isArray(p.benefits) ? p.benefits : [],
  has_3d: Boolean(p.has3D),
  rating: Number(p.rating) || 5.0,
  reviews_count: Number(p.reviewsCount) || 100
});

export function ShopProvider({ children }) {
  // Products state (preserves admin additions, edits, order & permanently removes deleted items)
  const [products, setProducts] = useState(() => {
    const deletedIds = getDeletedProductIds();
    const saved = localStorage.getItem('ayaana_products');

    if (!saved) {
      return PRODUCTS.filter((p) => !deletedIds.has(p.id) && !DEPRECATED_PRODUCT_IDS.has(p.id));
    }

    try {
      const parsed = JSON.parse(saved);
      // Clean up deprecated template items if present, AND any deleted IDs
      const cleaned = parsed.filter(
        (p) => !DEPRECATED_PRODUCT_IDS.has(p.id) && !deletedIds.has(p.id)
      );

      // Only import new official products if they were NEVER deleted by the admin
      const existingIds = new Set(cleaned.map((p) => p.id));
      const missingFromOfficial = PRODUCTS.filter(
        (p) => !existingIds.has(p.id) && !deletedIds.has(p.id) && !DEPRECATED_PRODUCT_IDS.has(p.id)
      );

      const finalProducts = [...cleaned, ...missingFromOfficial];
      // Immediately scrub old cached template products from localStorage
      localStorage.setItem('ayaana_products', JSON.stringify(finalProducts));
      return finalProducts;
    } catch {
      return PRODUCTS.filter((p) => !deletedIds.has(p.id) && !DEPRECATED_PRODUCT_IDS.has(p.id));
    }
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ayaana_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('ayaana_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Currency: 'PKR' or 'USD'
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('ayaana_currency') || 'PKR';
  });

  // Active discount code
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code, percent, label }

  // Modal / Drawer visibility
  const [activeProduct, setActiveProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('admin') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    window.__openAdmin = () => setIsAdminOpen(true);
  }, []);

  // Auto-migrate activeProduct if currently viewing deprecated radiance-skin-repair-cream
  useEffect(() => {
    if (activeProduct && activeProduct.id === 'radiance-skin-repair-cream') {
      const faceCream = products.find(p => p.id === 'face-whitening-cream');
      if (faceCream) setActiveProduct(faceCream);
    }
  }, [activeProduct, products]);

  // ── Site Customization State ──────────────────────────────────────────────────
  // Hero Section settings
  const [heroSettings, setHeroSettings] = useState(() => {
    const saved = localStorage.getItem('ayaana_hero_settings');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return {
      heroProductId: null,      // null = use isHero flag or products[0]
      heroModelType: 'hand-feet-cream', // 'hand-feet-cream' | 'face-whitening-cream' | 'toner' | 'natural-glow-mask'
      heroBadge1: '✦ 100% Herbal Brightening',
      heroBadge2: '✦ Deep Velvet Moisture'
    };
  });

  // Transformation section 3D model
  const [transformationModel, setTransformationModel] = useState(() => {
    const saved = localStorage.getItem('ayaana_transformation_model');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return {
      modelType: 'hand-feet-cream', // 'hand-feet-cream' | 'face-whitening-cream' | 'toner'
      productId: null               // which product's price/name to show alongside
    };
  });

  // Admin-managed reviews
  const DEFAULT_REVIEWS = [
    { id: 1, name: 'Sania Tariq', city: 'Lahore', product: 'Hand & Foot Complex + Skin Repair Cream', rating: 5, date: '3 days ago', text: 'Se boht zyada bright howy n 😊 Mai apko before and after ke picture bi send krti hu abi 🤗 Mere dark knuckles par koi cream asar nahi kar rahi thi, Ayaana\'s ke 1 week use ke baad difference clear hai!', verified: true },
    { id: 2, name: 'Dr. Fatima Zahra', city: 'Islamabad', product: 'Radiance Skin Repair Cream', rating: 5, date: '1 week ago', text: 'As a physician, I check ingredient lists very strictly. The balance of 5% niacinamide with pure bio-ceramides is formulated to international dermatology standards. My dry winter skin has completely healed.', verified: true },
    { id: 3, name: 'Areeba Khan', city: 'Karachi', product: '24K Gold Radiance Glow Serum', rating: 5, date: '2 weeks ago', text: 'The gold serum gives an unbelievable glass-skin dewy finish under makeup! Not sticky at all, it absorbs in 30 seconds and gives this ethereal lit-from-within glow.', verified: true },
    { id: 4, name: 'Hira Mansoor', city: 'Faisalabad', product: 'Herbal Whitening & Radiance Toner', rating: 5, date: '2 weeks ago', text: 'The natural rose hydrosol smell is divine. My enlarged pores around the nose area tightened up so fast. Best toner I have ever used in Pakistan.', verified: true },
    { id: 5, name: 'Zainab Mir', city: 'Dubai, UAE', product: 'Complete Radiance Bundle', rating: 5, date: '3 weeks ago', text: 'Ordered the full collection to Dubai and it arrived via DHL safely packed with luxury gift ribbon. The packaging looks so high end, exactly like French luxury cosmetic brands.', verified: true },
    { id: 6, name: 'Mahnoor Bilal', city: 'Rawalpindi', product: 'Miracle Glow Night Balm', rating: 5, date: '1 month ago', text: 'Waking up with zero dullness is real! My skin feels super soft and plump every morning. Ayaana is also very responsive on WhatsApp for advice.', verified: true }
  ];

  const [siteReviews, setSiteReviews] = useState(() => {
    const saved = localStorage.getItem('ayaana_reviews');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return DEFAULT_REVIEWS;
  });

  // Girl's Image / Living Model Routine Products
  const [portraitProductIds, setPortraitProductIds] = useState(() => {
    const saved = localStorage.getItem('ayaana_portrait_products');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return ['face-whitening-cream', 'herbal-whitening-toner'];
  });
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);

  // Persist customization state
  useEffect(() => { localStorage.setItem('ayaana_hero_settings', JSON.stringify(heroSettings)); }, [heroSettings]);
  useEffect(() => { localStorage.setItem('ayaana_transformation_model', JSON.stringify(transformationModel)); }, [transformationModel]);
  useEffect(() => { localStorage.setItem('ayaana_reviews', JSON.stringify(siteReviews)); }, [siteReviews]);
  useEffect(() => { localStorage.setItem('ayaana_portrait_products', JSON.stringify(portraitProductIds)); }, [portraitProductIds]);

  const updateHeroSettings = (updates) => setHeroSettings(prev => ({ ...prev, ...updates }));
  const updateTransformationModel = (updates) => setTransformationModel(prev => ({ ...prev, ...updates }));
  const updatePortraitProductIds = (ids) => setPortraitProductIds(ids);
  const addReview = (review) => {
    const newReview = { ...review, id: Date.now(), verified: true };
    setSiteReviews(prev => [newReview, ...prev]);
    return newReview;
  };
  const deleteReview = (reviewId) => setSiteReviews(prev => prev.filter(r => r.id !== reviewId));
  const updateReview = (reviewId, updates) => setSiteReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updates } : r));

  // Multiple Admin Management State
  const [adminsList, setAdminsList] = useState(() => {
    const defaultAdmins = [
      {
        id: 'admin-super-basit',
        name: 'Basit Nayab',
        email: 'basitmalix01@gmail.com',
        password: 'Muhana5424@.',
        role: 'Super Admin',
        createdAt: '2026-09-26'
      },
      {
        id: 'admin-syeda',
        name: 'Syeda Ayaana',
        email: 'admin@ayaanas.com',
        password: 'ayaana123',
        role: 'Store Manager',
        createdAt: '2026-09-01'
      }
    ];

    const saved = localStorage.getItem('ayaana_admins_list');
    if (!saved) return defaultAdmins;
    try {
      const parsed = JSON.parse(saved);
      // Ensure the user's primary Super Admin is always present
      if (!parsed.some((a) => a.email.toLowerCase() === 'basitmalix01@gmail.com')) {
        parsed.unshift(defaultAdmins[0]);
      }
      return parsed;
    } catch {
      return defaultAdmins;
    }
  });

  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    const saved = localStorage.getItem('ayaana_current_admin');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      id: 'admin-super-basit',
      name: 'Basit Nayab',
      email: 'basitmalix01@gmail.com',
      role: 'Super Admin'
    };
  });

  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('ayaana_admin_creds');
    return saved ? JSON.parse(saved) : { email: "basitmalix01@gmail.com", password: "Muhana5424@." };
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('ayaana_admin_logged_in') === 'true';
  });

  // Recent order state for tracking & confirmation
  const [recentOrders, setRecentOrders] = useState(() => {
    const saved = localStorage.getItem('ayaana_orders');
    return saved ? JSON.parse(saved) : [
      {
        orderId: "AY-89241",
        customerName: "Ayesha Malik",
        phone: "+92 300 1234567",
        city: "Lahore",
        address: "Gulberg III, Lahore",
        paymentMethod: "Cash on Delivery (COD)",
        items: [
          { name: "Radiance Skin Repair Cream", volume: "50ml", quantity: 1, pricePKR: 2850, priceUSD: 18 }
        ],
        total: 2850,
        currency: "PKR",
        status: "In Transit",
        date: "2026-09-18",
        courier: "TCS Express",
        trackingNo: "TCS992014881"
      }
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ayaana_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ayaana_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('ayaana_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('ayaana_products', JSON.stringify(products));
  }, [products]);

  // 🔄 Real-time Cloud Sync with Supabase on Mount & Tab Focus
  useEffect(() => {
    let isMounted = true;

    async function syncProductsFromCloud() {
      try {
        const { data, error } = await supabaseQuery('products?select=*&order=created_at.asc');
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapDbToProduct);
          const deletedIds = getDeletedProductIds();
          const cleanProducts = mapped.filter((p) => !deletedIds.has(p.id) && !DEPRECATED_PRODUCT_IDS.has(p.id));

          if (isMounted && cleanProducts.length > 0) {
            setProducts(cleanProducts);
            localStorage.setItem('ayaana_products', JSON.stringify(cleanProducts));
          }
        }
      } catch (e) {
        console.warn("Cloud products sync fallback:", e);
      }
    }

    syncProductsFromCloud();

    // Re-check cloud when user refocuses tab / switches browser
    const handleFocus = () => { syncProductsFromCloud(); };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('ayaana_orders', JSON.stringify(recentOrders));
  }, [recentOrders]);

  useEffect(() => {
    localStorage.setItem('ayaana_admins_list', JSON.stringify(adminsList));
  }, [adminsList]);

  useEffect(() => {
    localStorage.setItem('ayaana_current_admin', JSON.stringify(currentAdminUser));
  }, [currentAdminUser]);

  useEffect(() => {
    localStorage.setItem('ayaana_admin_creds', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  useEffect(() => {
    localStorage.setItem('ayaana_admin_logged_in', isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // Lock background body scroll when any modal or drawer is active
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      activeProduct || isCartOpen || isWishlistOpen || isCheckoutOpen || isTrackingOpen || isAdminOpen || isPortraitModalOpen
    );
    if (isAnyModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [activeProduct, isCartOpen, isWishlistOpen, isCheckoutOpen, isTrackingOpen, isAdminOpen]);

  // Admin Auth Methods
  const adminLogin = (emailOrUser, password) => {
    const inputClean = (emailOrUser || '').trim().toLowerCase();
    const passInput = (password || '').trim();

    // Check against all registered admins
    const matchedAdmin = adminsList.find((admin) => {
      const admEmail = admin.email.toLowerCase();
      const admUsername = admEmail.split('@')[0];
      const matchIdentity = inputClean === admEmail || inputClean === admUsername || (inputClean === 'ayaana' && admEmail === 'admin@ayaanas.com');
      return matchIdentity && admin.password === passInput;
    });

    if (matchedAdmin) {
      setIsAdminLoggedIn(true);
      setCurrentAdminUser(matchedAdmin);
      setAdminCredentials({ email: matchedAdmin.email, password: matchedAdmin.password });
      return { success: true, user: matchedAdmin };
    }

    // Fallback legacy match
    if (
      (inputClean === 'basitmalix01@gmail.com' || inputClean === 'basit') &&
      passInput === 'Muhana5424@.'
    ) {
      const superUser = {
        id: 'admin-super-basit',
        name: 'Basit Nayab',
        email: 'basitmalix01@gmail.com',
        role: 'Super Admin',
        password: 'Muhana5424@.'
      };
      setIsAdminLoggedIn(true);
      setCurrentAdminUser(superUser);
      return { success: true, user: superUser };
    }

    return {
      success: false,
      message: "Invalid credentials. Use your registered email and password."
    };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  const addNewAdmin = (newAdmin) => {
    if (!newAdmin.email || !newAdmin.password) {
      return { success: false, message: "Email and password are required." };
    }
    const emailClean = newAdmin.email.trim().toLowerCase();
    if (adminsList.some((a) => a.email.toLowerCase() === emailClean)) {
      return { success: false, message: "An admin with this email already exists." };
    }

    const createdAdmin = {
      id: `admin-${Date.now()}`,
      name: newAdmin.name?.trim() || emailClean.split('@')[0],
      email: emailClean,
      password: newAdmin.password,
      role: newAdmin.role || 'Store Manager',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAdminsList((prev) => [...prev, createdAdmin]);
    return { success: true, admin: createdAdmin };
  };

  const deleteAdmin = (adminId) => {
    if (adminsList.length <= 1) {
      return { success: false, message: "Cannot remove the only remaining admin account." };
    }
    if (currentAdminUser?.id === adminId) {
      return { success: false, message: "You cannot delete your own currently active account." };
    }
    setAdminsList((prev) => prev.filter((a) => a.id !== adminId));
    return { success: true };
  };

  const updateAdminPassword = (newPassword) => {
    setAdminCredentials((prev) => ({ ...prev, password: newPassword }));
    if (currentAdminUser) {
      setAdminsList((prev) =>
        prev.map((a) => (a.id === currentAdminUser.id ? { ...a, password: newPassword } : a))
      );
    }
    return { success: true };
  };

  // Admin Product Management (Supports Multiple Pictures)
  const addNewProduct = (newProd) => {
    const id = (newProd.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    
    // Multiple images handling
    const imageList = Array.isArray(newProd.images) && newProd.images.filter(Boolean).length > 0
      ? newProd.images.filter(Boolean)
      : [newProd.image || "/assets/hero_cream.jpg"];

    const primaryImage = newProd.image || imageList[0];

    const productToAdd = {
      id,
      name: newProd.name,
      tagline: newProd.tagline || "Artisanal botanical beauty formulation",
      category: newProd.category || "repair-creams",
      categoryName: newProd.categoryName || "Repair Creams",
      volume: newProd.volume || "50ml",
      pricePKR: Number(newProd.pricePKR) || 2500,
      originalPricePKR: Number(newProd.originalPricePKR) || Math.round(Number(newProd.pricePKR) * 1.2),
      priceUSD: Number((Number(newProd.pricePKR) * 0.0036).toFixed(2)) || 15.00,
      originalPriceUSD: Number((Number(newProd.pricePKR) * 0.0036 * 1.2).toFixed(2)) || 18.00,
      rating: 5.0,
      reviewsCount: 1,
      badge: newProd.badge || "New Arrival",
      isHero: false,
      image: primaryImage,
      images: imageList,
      description: newProd.description || "Crafted with pure botanicals and calibrated active brighteners for radiant daily skin renewal.",
      howToUse: newProd.howToUse || "Apply evenly on clean skin morning and evening.",
      ingredients: newProd.ingredients || "Organic Rose Water, Niacinamide, Ceramides, Herbal Extracts.",
      benefits: ["Restores skin barrier", "Promotes natural luminous glow", "Deep 72h moisture"],
      clinicalResults: "100% agreed skin felt smoother and brighter.",
      stock: Number(newProd.stock) || 50
    };

    // If the added product was previously in the deleted products register, remove it
    const deletedSet = getDeletedProductIds();
    if (deletedSet.has(productToAdd.id)) {
      deletedSet.delete(productToAdd.id);
      saveDeletedProductIds(deletedSet);
    }

    setProducts((prev) => {
      const updated = [productToAdd, ...prev];
      localStorage.setItem('ayaana_products', JSON.stringify(updated));
      return updated;
    });

    // ☁️ Sync to Supabase Cloud Database (all devices get this immediately)
    supabaseQuery('products', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates',
      body: mapProductToDb(productToAdd)
    }).catch((err) => console.warn("Cloud product add error:", err));

    return productToAdd;
  };

  const updateProduct = (updatedProd) => {
    const updatedPricePKR = Number(updatedProd.pricePKR);
    const imageList = Array.isArray(updatedProd.images) && updatedProd.images.filter(Boolean).length > 0
      ? updatedProd.images.filter(Boolean)
      : [updatedProd.image];
    const primaryImage = updatedProd.image || imageList[0];

    const mergedProduct = {
      ...updatedProd,
      image: primaryImage,
      images: imageList,
      pricePKR: updatedPricePKR,
      priceUSD: Number((updatedPricePKR * 0.0036).toFixed(2)),
      originalPricePKR: Math.round(updatedPricePKR * 1.2),
      stock: Number(updatedProd.stock) !== undefined ? Number(updatedProd.stock) : 50
    };

    setProducts((prev) => {
      const updated = prev.map((item) => (item.id === updatedProd.id ? { ...item, ...mergedProduct } : item));
      localStorage.setItem('ayaana_products', JSON.stringify(updated));
      return updated;
    });

    // ☁️ Sync update to Supabase Cloud Database (all devices get this immediately)
    supabaseQuery(`products?id=eq.${updatedProd.id}`, {
      method: 'PATCH',
      body: {
        name: updatedProd.name,
        tagline: updatedProd.tagline,
        category: updatedProd.category,
        category_name: updatedProd.categoryName,
        volume: updatedProd.volume,
        price_pkr: updatedPricePKR,
        original_price_pkr: Math.round(updatedPricePKR * 1.2),
        price_usd: Number((updatedPricePKR * 0.0036).toFixed(2)),
        stock: Number(updatedProd.stock) !== undefined ? Number(updatedProd.stock) : 50,
        badge: updatedProd.badge,
        image: primaryImage,
        images: imageList,
        description: updatedProd.description,
        how_to_use: updatedProd.howToUse,
        ingredients: updatedProd.ingredients
      }
    }).catch((err) => console.warn("Cloud product update error:", err));
  };

  const deleteProduct = (productId) => {
    if (!productId) return;

    // 1. Permanently register in deleted products list so it NEVER auto-restores on page reload
    const deletedSet = getDeletedProductIds();
    deletedSet.add(productId);
    saveDeletedProductIds(deletedSet);

    // 2. Remove product from products state & immediately sync to localStorage
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem('ayaana_products', JSON.stringify(updated));
      return updated;
    });

    // 3. Clear activeProduct modal if this product was open
    setActiveProduct((current) => (current?.id === productId ? null : current));

    // 4. Remove from Cart
    setCart((prev) => {
      const updatedCart = prev.filter((item) => item.id !== productId);
      localStorage.setItem('ayaana_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });

    // 5. Remove from Wishlist
    setWishlist((prev) => {
      const updatedWishlist = prev.filter((item) => item.id !== productId);
      localStorage.setItem('ayaana_wishlist', JSON.stringify(updatedWishlist));
      return updatedWishlist;
    });

    // 6. Clean up site customization pointers
    setHeroSettings((prev) => (prev.heroProductId === productId ? { ...prev, heroProductId: null } : prev));
    setTransformationModel((prev) => (prev.productId === productId ? { ...prev, productId: null } : prev));
    setPortraitProductIds((prev) => prev.filter((id) => id !== productId));

    // 7. Background delete from Supabase cloud database if connected
    try {
      supabaseQuery(`products?id=eq.${productId}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // Ignore background cloud sync error if offline or not configured
    }
  };

  const resetProductsToDefault = () => {
    localStorage.removeItem(DELETED_PRODUCTS_KEY);
    localStorage.setItem('ayaana_products', JSON.stringify(PRODUCTS));
    setProducts(PRODUCTS);
  };

  const reorderProducts = (reorderedList) => {
    setProducts(reorderedList);
    localStorage.setItem('ayaana_products', JSON.stringify(reorderedList));
  };

  const moveProductToFirst = (productId) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === productId);
      if (idx <= 0) return prev;
      const target = prev[idx];
      const rest = prev.filter((p) => p.id !== productId);
      const updated = [target, ...rest];
      localStorage.setItem('ayaana_products', JSON.stringify(updated));
      return updated;
    });
  };

  const moveProduct = (fromIndex, toIndex) => {
    setProducts((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      localStorage.setItem('ayaana_products', JSON.stringify(updated));
      return updated;
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setRecentOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Price formatting helper for dual currency (amountPKR, amountUSD)
  const formatPrice = (amountPKR, amountUSD) => {
    if (currency === 'USD') {
      const val = amountUSD !== undefined ? amountUSD : (amountPKR * BRAND_CONFIG.currency.USD.rate);
      return `$${Number(val).toFixed(2)}`;
    }
    return `Rs. ${Math.round(Number(amountPKR)).toLocaleString()}`;
  };

  // Helper when value is already in the currently active currency
  const formatCurrency = (val) => {
    if (currency === 'USD') {
      return `$${Number(val).toFixed(2)}`;
    }
    return `Rs. ${Math.round(Number(val)).toLocaleString()}`;
  };

  const getNumericPrice = (product) => {
    return currency === 'USD' ? product.priceUSD : product.pricePKR;
  };

  // Cart operations
  const addToCart = (product, quantity = 1, volume = null) => {
    const selectedVolume = volume || product.volume;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.volume === selectedVolume
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { ...product, quantity, volume: selectedVolume }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, volume) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.volume === volume)));
  };

  const updateCartQuantity = (productId, volume, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, volume);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.volume === volume
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Cart financial calculations
  const cartSubtotalPKR = cart.reduce((sum, item) => sum + item.pricePKR * item.quantity, 0);
  const cartSubtotalUSD = cart.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0);

  const cartSubtotal = currency === 'USD' ? cartSubtotalUSD : cartSubtotalPKR;

  // Discount calculation
  const discountAmount = appliedDiscount
    ? (cartSubtotal * (appliedDiscount.percent / 100))
    : 0;

  // Shipping calculation
  const isFreeShipping = currency === 'USD'
    ? cartSubtotal >= BRAND_CONFIG.shippingThresholdUSD
    : cartSubtotal >= BRAND_CONFIG.shippingThresholdPKR;

  const shippingFee = cart.length === 0 || isFreeShipping
    ? 0
    : (currency === 'USD' ? BRAND_CONFIG.expressDeliveryFeeUSD : BRAND_CONFIG.expressDeliveryFeePKR);

  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Apply promo code
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (BRAND_CONFIG.promoCodes[cleanCode]) {
      const promo = BRAND_CONFIG.promoCodes[cleanCode];
      setAppliedDiscount({
        code: cleanCode,
        percent: promo.discountPercent,
        label: promo.label
      });
      return { success: true, message: `${promo.label} applied!` };
    }
    return { success: false, message: "Invalid promo code. Try 'GLOW10' or 'AYAANA20'" };
  };

  const removeCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode('');
  };

  // WhatsApp Order Link Generator
  const generateWhatsAppOrderUrl = (customerDetails = null) => {
    if (cart.length === 0) return `https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}`;

    let message = `*🌸 NEW ORDER - AYAANA'S LUXURY SKINCARE* 🌸\n\n`;
    message += `*Items Ordered:*\n`;
    cart.forEach((item, idx) => {
      const itemPrice = currency === 'USD' ? `$${item.priceUSD}` : `Rs. ${item.pricePKR}`;
      message += `${idx + 1}. *${item.name}* (${item.volume}) x ${item.quantity} = ${itemPrice}\n`;
    });

    message += `\n*Subtotal:* ${formatPrice(cartSubtotalPKR, cartSubtotalUSD)}`;
    if (appliedDiscount) {
      message += `\n*Discount (${appliedDiscount.code}):* -${formatPrice(cartSubtotalPKR * (appliedDiscount.percent / 100), cartSubtotalUSD * (appliedDiscount.percent / 100))}`;
    }
    message += `\n*Shipping:* ${isFreeShipping ? "FREE Delivery" : formatPrice(BRAND_CONFIG.expressDeliveryFeePKR, BRAND_CONFIG.expressDeliveryFeeUSD)}`;
    message += `\n*Grand Total:* *${formatPrice(cartTotal, cartTotal)}*\n`;

    if (customerDetails) {
      message += `\n*Customer Shipping Details:*`;
      message += `\n• *Name:* ${customerDetails.name}`;
      message += `\n• *Phone:* ${customerDetails.phone}`;
      message += `\n• *City:* ${customerDetails.city}`;
      message += `\n• *Delivery Address:* ${customerDetails.address}`;
      if (customerDetails.paymentMethod) {
        message += `\n• *Payment:* ${customerDetails.paymentMethod}`;
      }
    } else {
      message += `\n_Please confirm my order and share estimated dispatch details!_`;
    }

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}?text=${encoded}`;
  };

  // Quick single product WhatsApp order URL
  const generateSingleProductWhatsAppUrl = (product, volume = null) => {
    const selectedVolume = volume || product.volume;
    const priceStr = formatPrice(product.pricePKR, product.priceUSD);
    const text = `*Hello Ayaana's Team!* 🌸\n\nI want to order:\n*Product:* ${product.name} (${selectedVolume})\n*Price:* ${priceStr}\n\nPlease confirm availability and dispatch timeline. Thank you!`;
    return `https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(text)}`;
  };

  // Place online order (creates mock order with tracking)
  const placeOrder = (orderData) => {
    const newOrderId = `AY-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      orderId: newOrderId,
      customerName: orderData.name,
      phone: orderData.phone,
      city: orderData.city,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod || "Cash on Delivery (COD)",
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      total: cartTotal,
      currency,
      status: "Processing Order",
      date: new Date().toISOString().split('T')[0],
      courier: "TCS Express & Trax",
      trackingNo: `TRX${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    setRecentOrders([newOrder, ...recentOrders]);
    clearCart();
    return newOrder;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        setProducts,
        addNewProduct,
        deleteProduct,
        resetProductsToDefault,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currency,
        setCurrency,
        formatPrice,
        formatCurrency,
        getNumericPrice,
        cartSubtotalPKR,
        cartSubtotalUSD,
        cartSubtotal,
        discountAmount,
        appliedDiscount,
        applyCoupon,
        removeCoupon,
        couponCode,
        setCouponCode,
        isFreeShipping,
        shippingFee,
        cartTotal,
        totalCartCount,
        activeProduct,
        setActiveProduct,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        adminsList,
        addNewAdmin,
        deleteAdmin,
        currentAdminUser,
        updateProduct,
        reorderProducts,
        moveProductToFirst,
        moveProduct,
        isAdminOpen,
        setIsAdminOpen,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        adminCredentials,
        updateAdminPassword,
        recentOrders,
        updateOrderStatus,
        placeOrder,
        generateWhatsAppOrderUrl,
        generateSingleProductWhatsAppUrl,
        // Site Customization
        heroSettings,
        updateHeroSettings,
        transformationModel,
        updateTransformationModel,
        portraitProductIds,
        setPortraitProductIds,
        updatePortraitProductIds,
        isPortraitModalOpen,
        setIsPortraitModalOpen,
        siteReviews,
        addReview,
        deleteReview,
        updateReview
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, BRAND_CONFIG } from '../data/products';
import {
  supabaseQuery,
  getValidSession,
  signInWithPassword,
  signOut,
  updateOwnPassword,
  signUpUser
} from '../lib/supabase';

function mapDbToAdmin(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: (row.created_at || '').split('T')[0]
  };
}

function mapDbToOrder(row) {
  return {
    orderId: row.order_id,
    customerName: row.customer_name,
    phone: row.phone,
    whatsapp: row.whatsapp,
    city: row.city,
    address: row.address,
    notes: row.notes,
    paymentMethod: row.payment_method,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal ?? row.total),
    discount: Number(row.discount || 0),
    shipping: Number(row.shipping || 0),
    promoCode: row.promo_code,
    total: Number(row.total),
    currency: row.currency || 'PKR',
    status: row.status,
    date: (row.created_at || '').split('T')[0],
    courier: row.courier,
    trackingNo: row.tracking_no
  };
}

// Look up the logged-in email in the admins table. Returns the admin or null.
async function resolveAdminForSession(session) {
  if (!session?.email) return null;
  const { data, error } = await supabaseQuery(
    `admins?select=id,name,email,role,created_at&email=eq.${encodeURIComponent(session.email.toLowerCase())}`
  );
  if (error || !Array.isArray(data) || data.length === 0) return null;
  return mapDbToAdmin(data[0]);
}

// Unguessable order ID like AY-7K3QX9P2 (no 0/O/1/I to avoid confusion)
function generateOrderId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return 'AY-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

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

function getDeletedProductIds() {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set([...parsed, ...DEPRECATED_PRODUCT_IDS]);
  } catch {
    return new Set(DEPRECATED_PRODUCT_IDS);
  }
}

function saveDeletedProductIds(setOrArray) {
  try {
    const arr = Array.from(setOrArray);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("Failed to save deleted product IDs:", e);
  }
}

const mapDbToProduct = (dbProd) => ({
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
  stock: dbProd.stock !== undefined && dbProd.stock !== null && !isNaN(Number(dbProd.stock)) ? Number(dbProd.stock) : 50,
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

const mapProductToDb = (p) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline || '',
  category: p.category || 'repair-creams',
  category_name: p.categoryName || '',
  volume: p.volume || '50g',
  price_pkr: Number(p.pricePKR) || 0,
  original_price_pkr: Number(p.originalPricePKR) || Math.round((Number(p.pricePKR) || 0) * 1.2),
  price_usd: Number(p.priceUSD) || Number(((Number(p.pricePKR) || 0) * 0.0036).toFixed(2)),
  stock: p.stock !== undefined && p.stock !== null && !isNaN(Number(p.stock)) ? Number(p.stock) : 50,
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
  const [activeProduct, setActiveProductRaw] = useState(null);

  const setActiveProduct = (prod) => {
    if (prod && typeof prod === 'object' && prod.id === 'radiance-skin-repair-cream') {
      const faceCream = products.find(p => p.id === 'face-whitening-cream');
      setActiveProductRaw(faceCream || prod);
    } else {
      setActiveProductRaw(prod);
    }
  };

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

  // Admin-managed reviews covering all official active products on website
  const REVIEWS_STORAGE_VERSION = 'ayaana_reviews_v5_strict';

  const DEFAULT_REVIEWS = [
    {
      id: 1,
      name: 'Sania Tariq',
      city: 'Lahore',
      productId: 'hand-and-feet-whitening-cream',
      product: 'Hand and Feet Whitening Cream',
      rating: 5,
      date: '3 days ago',
      text: 'Se boht zyada bright howy n 😊 Mai apko before and after ke picture bi send krti hu abi 🤗 Mere dark knuckles aur feet par koi cream asar nahi kar rahi thi, Ayaana\'s ke 1 week use ke baad difference clear hai!',
      verified: true
    },
    {
      id: 2,
      name: 'Dr. Fatima Zahra',
      city: 'Islamabad',
      productId: 'face-whitening-cream',
      product: 'Face Whitening Cream',
      rating: 5,
      date: '5 days ago',
      text: 'As a physician, I check ingredient lists very strictly. The 5% niacinamide and pure rose hydrosol formula gives spotless brightness without causing any redness or skin peeling. 100% gentle and effective.',
      verified: true
    },
    {
      id: 3,
      name: 'Areeba Khan',
      city: 'Karachi',
      productId: '24k-gold-radiance-glow-serum',
      product: '24K Gold Radiance Glow Serum',
      rating: 5,
      date: '1 week ago',
      text: 'The gold serum gives an unbelievable glass-skin dewy finish under makeup! Not sticky at all, it absorbs in 30 seconds and gives this ethereal lit-from-within glow.',
      verified: true
    },
    {
      id: 4,
      name: 'Mahnoor Bilal',
      city: 'Rawalpindi',
      productId: 'ayaana-herbal-hair-shampoo',
      product: 'Ayaana Herbal Hair Shampoo',
      rating: 5,
      date: '1 week ago',
      text: 'Amla, Reetha aur Shikakai ka genuine sulfate-free herbal shampoo hai! Hair fall pehle 2-3 washes mein hi drastically stop ho gaya aur baal boht silky, soft aur naturally glossy lagte hain.',
      verified: true
    },
    {
      id: 5,
      name: 'Zainab Mir',
      city: 'Multan',
      productId: 'ayaana-herbal-oil',
      product: 'Ayaana Herbal Oil',
      rating: 5,
      date: '2 weeks ago',
      text: 'Kalonji aur Rosemary oil ki blend kamal hai! Scalp ki dryness aur dandruff khatam ho gayi, aur hair roots visibly strong ho gaye hain. Pure non-greasy organic formulation.',
      verified: true
    },
    {
      id: 6,
      name: 'Farah Siddiqui',
      city: 'Karachi',
      productId: 'natural-weight-loss-powder',
      product: 'Natural Weight Loss Powder',
      rating: 5,
      date: '2 weeks ago',
      text: '100% natural herbal formula hai, zero synthetic chemicals. Daily warm water ke sath lene se bloating khatam ho gayi aur metabolism boht active ho gaya. Already lost 3.5 kg naturally!',
      verified: true
    },
    {
      id: 7,
      name: 'Anum Sheikh',
      city: 'Faisalabad',
      productId: 'natural-glow-mask',
      product: 'Natural Glow Mask',
      rating: 5,
      date: '3 weeks ago',
      text: 'Instantly dullness khatam kar deta hai! 15 minutes lagane ke baad skin aese glowing aur fresh lagti hai jaise parlor se expensive facial karwaya ho. Kaolin clay aur rose extract se pores bhi tight ho gaye.',
      verified: true
    },
    {
      id: 8,
      name: 'Hira Mansoor',
      city: 'Sialkot',
      productId: 'whitening-toner',
      product: 'Whitening Toner',
      rating: 5,
      date: '3 weeks ago',
      text: 'The natural rose hydrosol smell is divine. My enlarged pores around the nose and cheeks tightened up so fast, and skin stays hydrated & fresh all day. Best toner I have ever used in Pakistan.',
      verified: true
    }
  ];

  const [siteReviews, setSiteReviews] = useState(() => {
    const version = localStorage.getItem('ayaana_reviews_version');
    const saved = localStorage.getItem('ayaana_reviews');

    if (saved && version === REVIEWS_STORAGE_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(r => {
            if (!r || !r.product) return false;
            const n = r.product.trim().toLowerCase();
            return !n.includes('complex + skin repair') &&
                   !n.includes('radiance skin repair') &&
                   !n.includes('night balm') &&
                   !n.includes('miracle glow') &&
                   !n.includes('bundle') &&
                   !n.includes('herbal whitening & radiance toner');
          });
          if (cleaned.length > 0) {
            return cleaned;
          }
        }
      } catch {}
    }

    // Auto-migrate to current website products reviews
    localStorage.setItem('ayaana_reviews_version', REVIEWS_STORAGE_VERSION);
    localStorage.setItem('ayaana_reviews', JSON.stringify(DEFAULT_REVIEWS));
    return DEFAULT_REVIEWS;
  });

  // Auto-purge any reviews for deleted or non-existent products whenever products list updates
  useEffect(() => {
    if (!products || products.length === 0) return;
    const activeNames = new Set(products.map(p => p.name.trim().toLowerCase()));
    const activeIds = new Set(products.map(p => p.id));

    setSiteReviews((prev) => {
      const filtered = prev.filter(r => {
        if (!r || !r.product) return false;
        const n = r.product.trim().toLowerCase();
        if (
          n.includes('complex + skin repair') ||
          n.includes('radiance skin repair') ||
          n.includes('night balm') ||
          n.includes('miracle glow') ||
          n.includes('bundle') ||
          n.includes('herbal whitening & radiance toner')
        ) {
          return false;
        }
        return activeNames.has(n) || (r.productId && activeIds.has(r.productId));
      });

      if (filtered.length !== prev.length) {
        localStorage.setItem('ayaana_reviews', JSON.stringify(filtered));
        return filtered;
      }
      return prev;
    });
  }, [products]);

  // Girl's Image / Living Model Routine Products
  const [portraitProductIds, setPortraitProductIds] = useState(() => {
    const saved = localStorage.getItem('ayaana_portrait_products');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return ['face-whitening-cream', 'whitening-toner'];
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

  // Admin state. Login is checked by Supabase Auth; who is an admin comes from
  // the `admins` table (see supabase_schema.sql). No passwords live in this code.
  const [adminsList, setAdminsList] = useState([]);
  const [currentAdminUser, setCurrentAdminUser] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);

  // Orders placed from this browser (lets a customer re-open their own order)
  const [recentOrders, setRecentOrders] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ayaana_orders') || '[]');
      // Drop the old demo order that used to be seeded here
      return Array.isArray(saved) ? saved.filter((o) => o && o.orderId !== 'AY-89241') : [];
    } catch {
      return [];
    }
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
            const dbIds = new Set(cleanProducts.map(p => p.id));
            const missingLocals = PRODUCTS.filter(p => !dbIds.has(p.id) && !deletedIds.has(p.id) && !DEPRECATED_PRODUCT_IDS.has(p.id));
            const finalMerged = [...cleanProducts, ...missingLocals];
            setProducts(finalMerged);
            localStorage.setItem('ayaana_products', JSON.stringify(finalMerged));
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

  // Wipe old insecure admin data (plaintext passwords) left in browsers
  useEffect(() => {
    ['ayaana_admins_list', 'ayaana_current_admin', 'ayaana_admin_creds', 'ayaana_admin_logged_in']
      .forEach((key) => localStorage.removeItem(key));
  }, []);

  const loadAdminData = async () => {
    const [adminsRes, ordersRes] = await Promise.all([
      supabaseQuery('admins?select=id,name,email,role,created_at&order=created_at.asc'),
      supabaseQuery('orders?select=*&order=created_at.desc')
    ]);
    if (!adminsRes.error && Array.isArray(adminsRes.data)) {
      setAdminsList(adminsRes.data.map(mapDbToAdmin));
    }
    if (!ordersRes.error && Array.isArray(ordersRes.data)) {
      setAdminOrders(ordersRes.data.map(mapDbToOrder));
    } else if (ordersRes.error) {
      console.warn('Could not load orders:', ordersRes.error);
    }
  };

  // Restore an existing admin session on page load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getValidSession();
      if (!session) return;
      const admin = await resolveAdminForSession(session);
      if (cancelled) return;
      if (admin) {
        setCurrentAdminUser(admin);
        setIsAdminLoggedIn(true);
        loadAdminData();
      } else {
        await signOut();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [activeProduct, isCartOpen, isWishlistOpen, isCheckoutOpen, isTrackingOpen, isAdminOpen, isPortraitModalOpen]);

  // Admin Auth Methods (Supabase Auth)
  const adminLogin = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter your admin email address.' };
    }
    const { session, error } = await signInWithPassword(cleanEmail, password || '');
    if (error || !session) {
      return { success: false, message: 'Invalid email or password.' };
    }
    const admin = await resolveAdminForSession(session);
    if (!admin) {
      await signOut();
      return { success: false, message: 'This account does not have admin access.' };
    }
    setCurrentAdminUser(admin);
    setIsAdminLoggedIn(true);
    loadAdminData();
    return { success: true, user: admin };
  };

  const adminLogout = async () => {
    setIsAdminLoggedIn(false);
    setCurrentAdminUser(null);
    setAdminsList([]);
    setAdminOrders([]);
    await signOut();
  };

  const addNewAdmin = async (newAdmin) => {
    if (currentAdminUser?.role !== 'Super Admin') {
      return { success: false, message: "Security Notice: Only Super Admin has permission to create new admin accounts." };
    }
    const emailClean = (newAdmin.email || '').trim().toLowerCase();
    if (!emailClean.includes('@')) {
      return { success: false, message: "A valid email is required." };
    }
    if (adminsList.some((a) => a.email.toLowerCase() === emailClean)) {
      return { success: false, message: "An admin with this email already exists." };
    }

    const { data, error } = await supabaseQuery('admins', {
      method: 'POST',
      body: {
        name: newAdmin.name?.trim() || emailClean.split('@')[0],
        email: emailClean,
        role: newAdmin.role || 'Store Admin'
      }
    });
    if (error) {
      return { success: false, message: "Could not save admin to the database. Please try again." };
    }
    const created = Array.isArray(data) && data[0] ? mapDbToAdmin(data[0]) : null;
    if (created) setAdminsList((prev) => [...prev, created]);

    // Try to create their login. If public sign-ups are disabled in Supabase,
    // the owner must add the user from the Supabase Dashboard instead.
    const dashboardNote = ' Now create their login in Supabase Dashboard → Authentication → Users → Add user.';
    let loginNote = dashboardNote;
    if (newAdmin.password && newAdmin.password.length >= 8) {
      const { error: signUpError } = await signUpUser(emailClean, newAdmin.password);
      if (!signUpError) loginNote = ' Their login was created (they may need to confirm their email).';
    }
    return { success: true, admin: created, message: `Admin access added for ${emailClean}.${loginNote}` };
  };

  const deleteAdmin = async (adminId) => {
    if (currentAdminUser?.role !== 'Super Admin') {
      return { success: false, message: "Security Notice: Only Super Admin has permission to remove admin accounts." };
    }
    if (adminsList.length <= 1) {
      return { success: false, message: "Cannot remove the only remaining admin account." };
    }
    if (currentAdminUser?.id === adminId) {
      return { success: false, message: "You cannot delete your own currently active account." };
    }
    const { error } = await supabaseQuery(`admins?id=eq.${encodeURIComponent(adminId)}`, { method: 'DELETE' });
    if (error) return { success: false, message: "Could not remove admin. Please try again." };
    setAdminsList((prev) => prev.filter((a) => a.id !== adminId));
    return { success: true };
  };

  const updateAdminPassword = async (newPassword) => {
    const { error } = await updateOwnPassword(newPassword);
    if (error) return { success: false, message: error.message };
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
      stock: updatedProd.stock !== undefined && updatedProd.stock !== null && !isNaN(Number(updatedProd.stock)) ? Number(updatedProd.stock) : 50
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
        stock: updatedProd.stock !== undefined && updatedProd.stock !== null && !isNaN(Number(updatedProd.stock)) ? Number(updatedProd.stock) : 50,
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

  const updateOrderStatus = async (orderId, newStatus) => {
    const previous = adminOrders;
    setAdminOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
    const { error } = await supabaseQuery(`orders?order_id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: { status: newStatus }
    });
    if (error) {
      console.warn('Order status update failed:', error);
      setAdminOrders(previous);
      return { success: false };
    }
    return { success: true };
  };

  // Customer order tracking: needs order ID + phone number used at checkout
  const trackOrder = async (orderId, phone) => {
    const { data, error } = await supabaseQuery('rpc/track_order', {
      method: 'POST',
      anonymous: true,
      body: { p_order_id: (orderId || '').trim(), p_phone: phone || '' }
    });
    if (error || !Array.isArray(data) || data.length === 0) return null;
    const row = data[0];
    return {
      orderId: row.order_id,
      status: row.status,
      courier: row.courier,
      trackingNo: row.tracking_no,
      total: Number(row.total),
      currency: row.currency,
      city: row.city,
      date: (row.created_at || '').split('T')[0]
    };
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
    return { success: false, message: "Invalid promo code." };
  };

  const removeCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode('');
  };

  // WhatsApp Order Link Generator
  const generateWhatsAppOrderUrl = (customerDetails = null) => {
    // An already-placed order: the cart is empty by now, so use the order itself
    if (customerDetails?.orderId && Array.isArray(customerDetails.items)) {
      const o = customerDetails;
      const fmt = (v) => (o.currency === 'USD' ? `$${Number(v).toFixed(2)}` : `Rs. ${Math.round(Number(v)).toLocaleString()}`);
      let msg = `*🌸 NEW ORDER #${o.orderId} - AYAANA'S LUXURY SKINCARE* 🌸\n\n*Items Ordered:*\n`;
      o.items.forEach((item, idx) => {
        const price = o.currency === 'USD' ? item.priceUSD : item.pricePKR;
        msg += `${idx + 1}. *${item.name}* (${item.volume}) x ${item.quantity} = ${fmt(price * item.quantity)}\n`;
      });
      msg += `\n*Subtotal:* ${fmt(o.subtotal)}`;
      if (o.discount > 0) msg += `\n*Discount${o.promoCode ? ` (${o.promoCode})` : ''}:* -${fmt(o.discount)}`;
      msg += `\n*Shipping:* ${o.shipping > 0 ? fmt(o.shipping) : 'FREE Delivery'}`;
      msg += `\n*Grand Total:* *${fmt(o.total)}*\n`;
      msg += `\n*Customer Shipping Details:*`;
      msg += `\n• *Name:* ${o.customerName}`;
      msg += `\n• *Phone:* ${o.phone}`;
      msg += `\n• *City:* ${o.city}`;
      msg += `\n• *Delivery Address:* ${o.address}`;
      msg += `\n• *Payment:* ${o.paymentMethod}`;
      return `https://wa.me/${BRAND_CONFIG.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`;
    }

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

  // Place online order: saved to Supabase so the store admin sees it on any device
  const placeOrder = async (orderData) => {
    const newOrder = {
      orderId: generateOrderId(),
      customerName: orderData.name.trim(),
      phone: orderData.phone.trim(),
      whatsapp: (orderData.whatsapp || '').trim(),
      city: orderData.city,
      address: orderData.address.trim(),
      notes: (orderData.notes || '').trim(),
      paymentMethod: orderData.paymentMethod || "Cash on Delivery (COD)",
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        volume: item.volume,
        quantity: item.quantity,
        pricePKR: item.pricePKR,
        priceUSD: item.priceUSD
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      promoCode: appliedDiscount?.code || null,
      total: cartTotal,
      currency,
      status: "Processing Order",
      date: new Date().toISOString().split('T')[0],
      courier: null,
      trackingNo: null
    };

    const { error } = await supabaseQuery('orders', {
      method: 'POST',
      prefer: 'return=minimal',
      anonymous: true,
      body: {
        order_id: newOrder.orderId,
        customer_name: newOrder.customerName,
        phone: newOrder.phone,
        whatsapp: newOrder.whatsapp || null,
        city: newOrder.city,
        address: newOrder.address,
        notes: newOrder.notes || null,
        payment_method: newOrder.paymentMethod,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        shipping: newOrder.shipping,
        promo_code: newOrder.promoCode,
        total: newOrder.total,
        currency: newOrder.currency,
        status: newOrder.status
      }
    });

    if (error) {
      console.warn('Order save failed:', error);
      return { order: null, error: "We couldn't place your order right now. Please try again or order on WhatsApp." };
    }

    setRecentOrders((prev) => [newOrder, ...prev].slice(0, 20));
    clearCart();
    setAppliedDiscount(null);
    return { order: newOrder, error: null };
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
        adminOrders,
        refreshAdminData: loadAdminData,
        trackOrder,
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

// eslint-disable-next-line react/only-export-components
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

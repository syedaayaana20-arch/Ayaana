-- ========================================================
-- Ayaana's Luxury Skincare - Secure Supabase Database Schema
-- Run this whole script in your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run). Safe to re-run.
--
-- HOW ADMIN LOGIN WORKS NOW
--   * Passwords are NEVER stored in this file, the code, or the admins table.
--   * Each admin gets a login in Supabase Auth:
--       Dashboard -> Authentication -> Users -> "Add user" (email + password,
--       tick "Auto Confirm User").
--   * The admins table below only says WHICH emails are admins and their role.
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. Admins (email + role only, no passwords)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Store Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remove the old plaintext password column if it exists
ALTER TABLE public.admins DROP COLUMN IF EXISTS password_hash;

-- Store emails lowercase so matching against the login email is reliable
UPDATE public.admins SET email = lower(email) WHERE email <> lower(email);

INSERT INTO public.admins (name, email, role)
VALUES
    ('Basit Nayab', 'basitmalix01@gmail.com', 'Super Admin'),
    ('Syeda Ayaana', 'syedaayaana20@gmail.com', 'Store Admin')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;

-- --------------------------------------------------------
-- 2. Products
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    volume TEXT DEFAULT '50ml',
    price_pkr NUMERIC NOT NULL,
    original_price_pkr NUMERIC,
    price_usd NUMERIC,
    stock INTEGER DEFAULT 50,
    badge TEXT,
    image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    how_to_use TEXT,
    ingredients TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    has_3d BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 3. Orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    order_id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery (COD)',
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'PKR',
    status TEXT DEFAULT 'Processing Order',
    courier TEXT,
    tracking_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- --------------------------------------------------------
-- 4. Helper functions: is the logged-in user an admin?
--    SECURITY DEFINER so they can read admins without exposing it.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
          AND role = 'Super Admin'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;

-- --------------------------------------------------------
-- 5. Order tracking for customers.
--    Needs BOTH the order ID and the phone number used at checkout,
--    and only returns delivery status (no address).
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_order(p_order_id TEXT, p_phone TEXT)
RETURNS TABLE (
    order_id TEXT,
    status TEXT,
    courier TEXT,
    tracking_no TEXT,
    total NUMERIC,
    currency TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT o.order_id, o.status, o.courier, o.tracking_no, o.total, o.currency, o.city, o.created_at
    FROM public.orders o
    WHERE upper(o.order_id) = upper(trim(p_order_id))
      AND length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) >= 10
      AND right(regexp_replace(o.phone, '[^0-9]', '', 'g'), 10)
        = right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 10)
    LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;

-- ========================================================
-- 6. Row Level Security
-- ========================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ---------------- PRODUCTS ----------------
DROP POLICY IF EXISTS "Public products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow product insertion" ON public.products;
DROP POLICY IF EXISTS "Allow product updates" ON public.products;
DROP POLICY IF EXISTS "Allow product deletion" ON public.products;
DROP POLICY IF EXISTS "Admins insert products" ON public.products;
DROP POLICY IF EXISTS "Admins update products" ON public.products;
DROP POLICY IF EXISTS "Admins delete products" ON public.products;

-- Everyone can browse products
CREATE POLICY "Public products viewable by everyone" ON public.products
    FOR SELECT TO anon, authenticated
    USING (true);

-- Only logged-in admins can add / edit / delete products
CREATE POLICY "Admins insert products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin() AND price_pkr > 0);

CREATE POLICY "Admins update products" ON public.products
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete products" ON public.products
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ---------------- ORDERS ----------------
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order management" ON public.orders;
DROP POLICY IF EXISTS "Allow order deletion" ON public.orders;
DROP POLICY IF EXISTS "Admins view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;

-- Customers can place a new order (always starts as "Processing Order")
CREATE POLICY "Public can insert orders" ON public.orders
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        length(trim(customer_name)) > 0 AND
        length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 10 AND
        length(trim(address)) > 0 AND
        jsonb_typeof(items) = 'array' AND
        jsonb_array_length(items) > 0 AND
        total >= 0 AND
        status = 'Processing Order' AND
        courier IS NULL AND
        tracking_no IS NULL
    );

-- Only admins can see customer orders (names, phones, addresses)
CREATE POLICY "Admins view orders" ON public.orders
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins update orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete orders" ON public.orders
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ---------------- ADMINS ----------------
DROP POLICY IF EXISTS "Admins full access to admins" ON public.admins;
DROP POLICY IF EXISTS "Admins view admins" ON public.admins;
DROP POLICY IF EXISTS "Super admin manages admins" ON public.admins;
DROP POLICY IF EXISTS "Super admin updates admins" ON public.admins;
DROP POLICY IF EXISTS "Super admin removes admins" ON public.admins;

CREATE POLICY "Admins view admins" ON public.admins
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Super admin manages admins" ON public.admins
    FOR INSERT TO authenticated
    WITH CHECK (public.is_super_admin() AND email = lower(email));

CREATE POLICY "Super admin updates admins" ON public.admins
    FOR UPDATE TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin() AND email = lower(email));

CREATE POLICY "Super admin removes admins" ON public.admins
    FOR DELETE TO authenticated
    USING (public.is_super_admin());

-- --------------------------------------------------------
-- 7. Fix Security Definer Functions (rls_auto_enable)
-- --------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
    ) THEN
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SECURITY INVOKER';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public';
    END IF;
END $$;

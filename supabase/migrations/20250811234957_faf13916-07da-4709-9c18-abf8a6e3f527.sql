-- 1) Harden timestamp helper function (set search_path, security definer)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Create roles enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END$$;

-- 3) Create user_roles table for RBAC (idempotent)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4) has_role helper (security definer, stable, hardened search_path)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

-- 5) RLS for user_roles
DO $$
BEGIN
  -- Drop existing policies to avoid duplicates during re-runs
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    DROP POLICY "Users can view their own roles" ON public.user_roles;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can manage roles'
  ) THEN
    DROP POLICY "Admins can manage roles" ON public.user_roles;
  END IF;
END$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6) Secure flights table policies
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- Drop overly-permissive policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'flights' AND policyname = 'Allow all operations on flights'
  ) THEN
    DROP POLICY "Allow all operations on flights" ON public.flights;
  END IF;
END$$;

-- Drop our policies for idempotency before re-creating
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='Anyone can view flights') THEN
    DROP POLICY "Anyone can view flights" ON public.flights;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='Admins can insert flights') THEN
    DROP POLICY "Admins can insert flights" ON public.flights;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='Admins can update flights') THEN
    DROP POLICY "Admins can update flights" ON public.flights;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='Admins can delete flights') THEN
    DROP POLICY "Admins can delete flights" ON public.flights;
  END IF;
END$$;

-- Public read access (FIDS can be public)
CREATE POLICY "Anyone can view flights"
  ON public.flights
  FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Admins can insert flights"
  ON public.flights
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update flights"
  ON public.flights
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete flights"
  ON public.flights
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 7) Keep updated_at current on UPDATEs
DROP TRIGGER IF EXISTS set_flights_updated_at ON public.flights;
CREATE TRIGGER set_flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ESQUEMA SQL PARA SUPABASE - PLATAFORMA "MANOAMIGA"
-- ============================================================================
-- Instrucciones:
-- 1. Abre tu proyecto en https://supabase.com/dashboard
-- 2. En el menú lateral izquierdo, haz clic en "SQL Editor" (icono de terminal).
-- 3. Haz clic en "+ New query", pega todo este contenido y presiona "Run" (o Ctrl+Enter).
-- ============================================================================

-- Habilitar extensión para generar identificadores únicos (UUID)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: perfiles (Solucionadores y Usuarios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hogar', 'limpieza', 'mudanzas', 'mandados', 'tecnologia')),
  category_label TEXT NOT NULL DEFAULT 'Hogar',
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 1,
  completed_jobs INTEGER NOT NULL DEFAULT 1,
  hourly_rate TEXT NOT NULL,
  response_time TEXT NOT NULL DEFAULT 'Responde en ~5 min',
  location TEXT NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  verified BOOLEAN NOT NULL DEFAULT true,
  available_today BOOLEAN NOT NULL DEFAULT true,
  bio TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT ARRAY['Atención rápida', 'Garantía'],
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. TABLA: solicitudes_ayuda (Problemas por Resolver)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.solicitudes_ayuda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hogar', 'limpieza', 'mudanzas', 'mandados', 'tecnologia')),
  category_label TEXT NOT NULL DEFAULT 'Hogar',
  location TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'Urgente (Hoy)',
  budget TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_verified BOOLEAN NOT NULL DEFAULT true,
  applicants_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Abierto' CHECK (status IN ('Abierto', 'En revisión', 'En proceso', 'Resuelta')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. TABLA: resenas (Calificaciones y Comentarios de Clientes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ============================================================================

-- Activar RLS en las tres tablas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_ayuda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

-- Políticas para "perfiles"
DROP POLICY IF EXISTS "Lectura publica de perfiles" ON public.perfiles;
CREATE POLICY "Lectura publica de perfiles"
  ON public.perfiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Registro de nuevos perfiles" ON public.perfiles;
CREATE POLICY "Registro de nuevos perfiles"
  ON public.perfiles FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Actualizacion de perfiles" ON public.perfiles;
CREATE POLICY "Actualizacion de perfiles"
  ON public.perfiles FOR UPDATE
  USING (true);

-- Políticas para "solicitudes_ayuda"
DROP POLICY IF EXISTS "Lectura publica de solicitudes" ON public.solicitudes_ayuda;
CREATE POLICY "Lectura publica de solicitudes"
  ON public.solicitudes_ayuda FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Creacion de solicitudes de ayuda" ON public.solicitudes_ayuda;
CREATE POLICY "Creacion de solicitudes de ayuda"
  ON public.solicitudes_ayuda FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Actualizacion de solicitudes de ayuda" ON public.solicitudes_ayuda;
CREATE POLICY "Actualizacion de solicitudes de ayuda"
  ON public.solicitudes_ayuda FOR UPDATE
  USING (true);

-- Políticas para "resenas"
DROP POLICY IF EXISTS "Lectura publica de resenas" ON public.resenas;
CREATE POLICY "Lectura publica de resenas"
  ON public.resenas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Creacion de resenas" ON public.resenas;
CREATE POLICY "Creacion de resenas"
  ON public.resenas FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- FISCALIZA — Migración inicial
-- ============================================================

-- ENUMS
CREATE TYPE plan_type    AS ENUM ('free', 'pro', 'business');
CREATE TYPE org_type     AS ENUM ('personal', 'business');
CREATE TYPE member_role  AS ENUM ('owner', 'admin', 'driver');
CREATE TYPE document_type AS ENUM (
  'licencia', 'revision_tecnica', 'permiso_circulacion', 'soap'
);

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE organizations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  type                org_type NOT NULL DEFAULT 'personal',
  plan                plan_type NOT NULL DEFAULT 'free',
  plan_expires_at     timestamptz,
  stripe_customer_id  text UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role             member_role NOT NULL DEFAULT 'owner',
  full_name        text,
  avatar_url       text
);

CREATE TABLE plan_limits (
  plan            plan_type PRIMARY KEY,
  max_vehicles    smallint NOT NULL,  -- -1 = ilimitado
  max_members     smallint NOT NULL,
  expiry_alerts   boolean NOT NULL DEFAULT false,
  qr_enabled      boolean NOT NULL DEFAULT false
);

CREATE TABLE vehicles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alias            text NOT NULL,
  plate            text NOT NULL UNIQUE,
  brand            text,
  model            text,
  year             smallint,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id       uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  organization_id  uuid NOT NULL REFERENCES organizations(id),
  type             document_type NOT NULL,
  storage_path     text NOT NULL,
  file_name        text NOT NULL,
  mime_type        text NOT NULL,
  expires_at       date,
  issued_at        date,
  is_current       boolean NOT NULL DEFAULT true,
  uploaded_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Solo un documento activo por vehículo+tipo
CREATE UNIQUE INDEX idx_document_current_unique
  ON documents(vehicle_id, type) WHERE is_current = true;

CREATE INDEX idx_vehicles_org_active
  ON vehicles(organization_id) WHERE is_active = true;

CREATE INDEX idx_documents_vehicle
  ON documents(vehicle_id) WHERE is_current = true;

CREATE INDEX idx_profiles_org
  ON profiles(organization_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Función genérica para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Valida límite de vehículos antes de insertar
CREATE OR REPLACE FUNCTION check_vehicle_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_plan      plan_type;
  v_max       smallint;
  v_current   bigint;
BEGIN
  SELECT o.plan INTO v_plan
  FROM organizations o
  WHERE o.id = NEW.organization_id;

  SELECT pl.max_vehicles INTO v_max
  FROM plan_limits pl
  WHERE pl.plan = v_plan;

  -- -1 = ilimitado
  IF v_max = -1 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_current
  FROM vehicles v
  WHERE v.organization_id = NEW.organization_id
    AND v.is_active = true;

  IF v_current >= v_max THEN
    RAISE EXCEPTION 'vehicle_limit_reached'
      USING HINT = 'Upgrade your plan to add more vehicles';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_vehicle_limit
  BEFORE INSERT ON vehicles
  FOR EACH ROW EXECUTE FUNCTION check_vehicle_limit();

-- Marca el documento anterior como is_current = false al insertar uno nuevo
CREATE OR REPLACE FUNCTION retire_previous_document()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE documents
  SET is_current = false
  WHERE vehicle_id = NEW.vehicle_id
    AND type       = NEW.type
    AND id        != NEW.id
    AND is_current = true;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_retire_previous_document
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION retire_previous_document();

-- Crea organización y profile automáticamente al registrar un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_org_id  uuid;
  v_name    text;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO organizations (name, type, plan)
  VALUES (v_name || '''s Fiscaliza', 'personal', 'free')
  RETURNING id INTO v_org_id;

  INSERT INTO profiles (id, organization_id, role, full_name)
  VALUES (NEW.id, v_org_id, 'owner', v_name);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits     ENABLE ROW LEVEL SECURITY;

-- Helper: org del usuario autenticado
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

-- Organizations
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id = auth_user_org_id());

CREATE POLICY "org_update" ON organizations FOR UPDATE
  USING (id = auth_user_org_id());

-- Profiles
CREATE POLICY "profile_select" ON profiles FOR SELECT
  USING (organization_id = auth_user_org_id());

CREATE POLICY "profile_update" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Vehicles
CREATE POLICY "vehicle_select" ON vehicles FOR SELECT
  USING (organization_id = auth_user_org_id());

CREATE POLICY "vehicle_insert" ON vehicles FOR INSERT
  WITH CHECK (organization_id = auth_user_org_id());

CREATE POLICY "vehicle_update" ON vehicles FOR UPDATE
  USING (organization_id = auth_user_org_id());

CREATE POLICY "vehicle_delete" ON vehicles FOR DELETE
  USING (organization_id = auth_user_org_id());

-- Documents
CREATE POLICY "document_select" ON documents FOR SELECT
  USING (organization_id = auth_user_org_id());

CREATE POLICY "document_insert" ON documents FOR INSERT
  WITH CHECK (organization_id = auth_user_org_id());

CREATE POLICY "document_update" ON documents FOR UPDATE
  USING (organization_id = auth_user_org_id());

-- Plan limits (lectura pública para todos los autenticados)
CREATE POLICY "plan_limits_select" ON plan_limits FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Storage bucket policies (aplicar desde el dashboard de Supabase):
-- Bucket: documents (privado)
-- SELECT: auth.uid() in (select id from profiles where organization_id = split_part(name, '/', 1)::uuid)
-- INSERT: idem
-- UPDATE/DELETE: idem

-- ============================================================
-- SEED
-- ============================================================

INSERT INTO plan_limits (plan, max_vehicles, max_members, expiry_alerts, qr_enabled)
VALUES
  ('free',     1,  1,  false, false),
  ('pro',     -1,  1,  true,  true),
  ('business',-1, 20,  true,  true);

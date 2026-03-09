-- ═══════════════════════════════════════════════════════════════════════════
-- SENSEI APP — Esquema PostgreSQL (Supabase)
-- Ejecutar en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Organizaciones (cada cliente = un dojo/gym/academia) ─────────────────────
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      TEXT NOT NULL,
    deporte     TEXT NOT NULL DEFAULT 'General',
    logo_url    TEXT,
    plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','elite')),
    colores     JSONB DEFAULT '{}',
    telegram_token TEXT,
    stripe_customer_id TEXT,
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Usuarios (maestros/admins de cada org) ────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email         TEXT UNIQUE NOT NULL,
    nombre        TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    rol           TEXT NOT NULL DEFAULT 'owner' CHECK (rol IN ('owner','admin','viewer')),
    activo        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Alumnos (miembros de cada org) ────────────────────────────────────────────
CREATE TABLE members (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    nombre            TEXT NOT NULL,
    actividad         TEXT,
    email             TEXT,
    telefono          TEXT,
    fecha_nacimiento  DATE,
    fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
    notas             TEXT,
    activo            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Pagos ─────────────────────────────────────────────────────────────────────
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    mes             SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio            SMALLINT NOT NULL,
    monto           NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado          TEXT NOT NULL DEFAULT 'pagado' CHECK (estado IN ('pagado','pendiente','parcial')),
    fecha_pago      TIMESTAMPTZ DEFAULT NOW(),
    comprobante_url TEXT,
    notas           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (member_id, mes, anio)  -- un pago por mes por alumno
);

-- ── Índices de performance ────────────────────────────────────────────────────
CREATE INDEX idx_members_org    ON members(org_id);
CREATE INDEX idx_payments_org   ON payments(org_id);
CREATE INDEX idx_payments_mes   ON payments(org_id, mes, anio);
CREATE INDEX idx_users_email    ON users(email);

-- ── Row Level Security (RLS) — aislamiento multi-tenant ──────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;

-- La API usa service_role_key (bypassa RLS), 
-- pero si usas client keys desde el frontend agrega policies aquí.

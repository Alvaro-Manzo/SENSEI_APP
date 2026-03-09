# 🥋 SENSEI APP — La herramienta de automatización de alumnos #1 de LATAM

> **SaaS multi-tenant** para gestión de academias deportivas — Taekwondo, MMA, Natación, Fútbol, Gimnasia y más.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)

---

## 🚀 ¿Qué es Sensei?

Sensei App es una plataforma **multi-tenant** donde cada academia deportiva tiene:

- 📱 **Bot de Telegram** propio para gestionar pagos por chat
- 🌐 **Panel web** para ver estadísticas, alumnos y reportes
- 🔒 **Datos 100% aislados** — ninguna academia ve los datos de otra
- 📊 **Reportes anuales** y alertas automáticas de deudores

### ✅ Funciones principales

| Función | Bot Telegram | Panel Web |
|---------|-------------|-----------|
| Registrar pago | `/pago Carlos 500` | ✅ |
| Ver lista de pagos | `/lista` | ✅ |
| Buscar alumno | `/buscar` | ✅ |
| Estadísticas del mes | `/stats` | ✅ |
| Alumnos deudores (2+ meses) | — | ✅ |
| Reporte anual por mes | — | ✅ |
| Agregar alumno | — | ✅ |

---

## 🏗️ Arquitectura

```
sensei-app/
├── backend/          # FastAPI + Supabase (Python 3.12)
│   ├── app/
│   │   ├── routers/  # auth, members, payments, reports, orgs
│   │   ├── core/     # config, database, security
│   │   └── schemas/  # Pydantic models
│   ├── Dockerfile
│   └── requirements.txt
├── bot/              # python-telegram-bot 20.x
│   ├── bot_saas.py   # Bot multi-tenant (llama al backend via HTTP)
│   └── Dockerfile
├── frontend/         # Next.js 15 + TypeScript + Tailwind
│   ├── src/app/      # login, register, dashboard, members, payments, settings
│   └── Dockerfile
├── infra/
│   └── schema.sql    # Schema PostgreSQL completo con RLS
└── docker-compose.yml
```

---

## 📦 Planes disponibles

| Plan | Alumnos | Precio |
|------|---------|--------|
| **Free** | 15 | Gratis (14 días) |
| **Starter** | 50 | $299 MXN/mes · $15 USD/mes |
| **Pro** | 200 | $599 MXN/mes · $29 USD/mes |
| **Elite** | Ilimitado | $999 MXN/mes · $49 USD/mes |

---

## ⚡ Setup rápido (desarrollo local)

### 1. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar `infra/schema.sql`
3. Copiar `Project URL` y `service_role key`

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus keys de Supabase
pip install -r requirements.txt
uvicorn app.main:app --reload
# API disponible en http://localhost:8000
# Docs en http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm install
npm run dev
# Panel en http://localhost:3000
```

### 4. Bot (1 por cliente)

```bash
cd bot
# Crear .env:
BOT_TOKEN=<token de @BotFather>
ORG_ID=<uuid de la organización en Supabase>
API_BASE_URL=http://localhost:8000/api
BOT_SECRET=<mismo SECRET_KEY del backend>

pip install python-telegram-bot httpx python-dotenv
python bot_saas.py
```

---

## 🐳 Deploy con Docker Compose

```bash
# 1. Copiar y llenar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Editar docker-compose.yml con tus BOT_TOKEN_ORGn y ORG_ID_n

# 3. Levantar
docker compose up -d

# Servicios:
# backend  → http://localhost:8000
# frontend → http://localhost:3000
# bot_org1 → responde en Telegram
```

### Agregar nuevo cliente (nueva academia)

```yaml
# En docker-compose.yml, duplicar el bloque bot_org1:
bot_org2:
  build: ./bot
  env_file: ./bot/.env.org2
  restart: unless-stopped
  depends_on:
    - backend
```

Crear `bot/.env.org2`:
```env
BOT_TOKEN=<nuevo token de @BotFather>
ORG_ID=<uuid de la nueva org en Supabase>
API_BASE_URL=http://backend:8000/api
BOT_SECRET=<mismo SECRET_KEY>
```

```bash
docker compose up -d bot_org2
```

---

## 🔐 Multi-tenancy y seguridad

- Cada request al API requiere un **JWT Bearer token**
- `get_current_org()` extrae el `org_id` del token y lo aplica en **todas las queries**
- Supabase tiene **Row Level Security (RLS)** habilitado en todas las tablas
- El bot usa `BOT_SECRET` para autenticarse con el backend (no accede directamente a la BD)
- Ningún cliente puede ver datos de otro, ni siquiera con el mismo JWT

---

## 🗄️ Base de datos (Supabase / PostgreSQL)

```sql
organizations  -- una fila por academia (org_id, nombre, deporte, plan, ...)
users          -- usuarios del panel web (email, password_hash, rol, org_id)
members        -- alumnos de cada academia (org_id, nombre, actividad, ...)
payments       -- pagos mensuales (org_id, member_id, mes, anio, monto, estado)
```

**Índices**: `org_id` en todas las tablas, `(mes, anio)` en payments.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| API | FastAPI 0.115 + Python 3.12 |
| Base de datos | PostgreSQL via Supabase |
| Auth | JWT (python-jose) + bcrypt |
| Bot | python-telegram-bot 20.8 + httpx |
| Frontend | Next.js 15 + React 19 + TypeScript |
| Estilos | Tailwind CSS 3 |
| Estado global | Zustand 4 |
| Gráficas | Recharts 2 |
| Deploy | Docker Compose |

---

## 📞 Comandos del bot

```
/pago Carlos 500          → Registra pago de Carlos en mes actual
/pago Carlos enero 500    → Registra pago de Carlos en enero
/lista                    → Lista de pagos del mes actual
/buscar                   → Búsqueda interactiva de alumno
/stats                    → Estadísticas del mes (pagados/pendientes/deudores)
/ayuda                    → Muestra todos los comandos
```

---

## 🌱 Roadmap

- [ ] Notificaciones automáticas de cobro (WhatsApp Business API)
- [ ] Subida de comprobantes (foto al bot)
- [ ] App móvil React Native
- [ ] Login con Google (OAuth)
- [ ] Facturación CFDI (México)
- [ ] Dashboard de superadmin (ver todos los clientes, MRR)
- [ ] API pública para integraciones

---

## 👨‍💻 Desarrollo

Proyecto iniciado por **Alvaro Manzo** — [@Alvaro-Manzo](https://github.com/Alvaro-Manzo)

> *"La herramienta de automatización de alumnos #1 del mundo"* 🌎

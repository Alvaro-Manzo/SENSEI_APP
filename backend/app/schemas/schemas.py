from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class Plan(str, Enum):
    free = "free"
    starter = "starter"
    pro = "pro"
    elite = "elite"


class UserRole(str, Enum):
    owner = "owner"
    admin = "admin"
    viewer = "viewer"


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    org_nombre: str
    deporte: str = "General"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Organizaciones ────────────────────────────────────────────────────────────

class OrgCreate(BaseModel):
    nombre: str
    deporte: str
    logo_url: Optional[str] = None
    telegram_token: Optional[str] = None


class OrgUpdate(BaseModel):
    nombre: Optional[str] = None
    deporte: Optional[str] = None
    logo_url: Optional[str] = None
    telegram_token: Optional[str] = None
    colores: Optional[dict] = None


class OrgResponse(BaseModel):
    id: str
    nombre: str
    deporte: str
    plan: Plan
    logo_url: Optional[str]
    telegram_token: Optional[str]
    created_at: datetime


# ── Alumnos ───────────────────────────────────────────────────────────────────

class MemberCreate(BaseModel):
    nombre: str
    actividad: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    notas: Optional[str] = None


class MemberUpdate(BaseModel):
    nombre: Optional[str] = None
    actividad: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    notas: Optional[str] = None
    activo: Optional[bool] = None


class MemberResponse(BaseModel):
    id: str
    org_id: str
    nombre: str
    actividad: Optional[str]
    email: Optional[str]
    telefono: Optional[str]
    activo: bool
    fecha_inscripcion: datetime
    notas: Optional[str]


# ── Pagos ─────────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    member_id: str
    mes: int          # 1-12
    anio: int
    monto: float
    estado: str = "pagado"   # pagado | pendiente | parcial
    notas: Optional[str] = None


class PaymentResponse(BaseModel):
    id: str
    member_id: str
    mes: int
    anio: int
    monto: float
    estado: str
    fecha_pago: Optional[datetime]
    comprobante_url: Optional[str]
    notas: Optional[str]

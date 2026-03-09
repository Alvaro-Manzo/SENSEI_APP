from fastapi import APIRouter, HTTPException, status
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.core.database import get_supabase
from app.core.security import hash_password, verify_password, create_access_token
import uuid

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest):
    """Registrar nuevo maestro/dueño + crear su organización"""
    db = get_supabase()

    # Verificar email único
    existing = db.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    # Crear organización
    org_id = str(uuid.uuid4())
    org = db.table("organizations").insert({
        "id": org_id,
        "nombre": data.org_nombre,
        "deporte": data.deporte,
        "plan": "free",
    }).execute()

    if not org.data:
        raise HTTPException(status_code=500, detail="Error creando organización")

    # Crear usuario con rol owner
    user_id = str(uuid.uuid4())
    user = db.table("users").insert({
        "id": user_id,
        "email": data.email,
        "nombre": data.nombre,
        "password_hash": hash_password(data.password),
        "org_id": org_id,
        "rol": "owner",
    }).execute()

    if not user.data:
        raise HTTPException(status_code=500, detail="Error creando usuario")

    token = create_access_token({"sub": user_id, "org_id": org_id, "rol": "owner"})
    return TokenResponse(access_token=token, user={"id": user_id, "email": data.email, "nombre": data.nombre, "org_id": org_id})


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """Login con email y contraseña"""
    db = get_supabase()

    res = db.table("users").select("*").eq("email", data.email).single().execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    user = res.data
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({"sub": user["id"], "org_id": user["org_id"], "rol": user["rol"]})
    return TokenResponse(
        access_token=token,
        user={"id": user["id"], "email": user["email"], "nombre": user["nombre"], "org_id": user["org_id"]}
    )


@router.get("/me")
async def me(token: str = None):
    """Obtener perfil del usuario actual — usar con Authorization: Bearer {token}"""
    from fastapi import Depends
    from app.core.security import get_current_user
    # Ver /api/auth/me con header Authorization
    return {"detail": "Usa Authorization: Bearer <token>"}

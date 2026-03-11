from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import MemberCreate, MemberUpdate, MemberResponse
from app.core.database import get_supabase
from app.core.security import get_current_user, get_current_org
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.get("/")
async def list_members(org_id: str = Depends(get_current_org)):
    """Listar todos los alumnos de la organización"""
    db = get_supabase()
    res = db.table("members").select("*").eq("org_id", org_id).eq("activo", True).order("nombre").execute()
    return res.data


@router.post("/", status_code=201)
async def create_member(data: MemberCreate, org_id: str = Depends(get_current_org)):
    """Registrar nuevo alumno"""
    db = get_supabase()

    # Verificar límite por plan
    count = db.table("members").select("id", count="exact").eq("org_id", org_id).eq("activo", True).execute()
    org = db.table("organizations").select("plan").eq("id", org_id).single().execute()
    limits = {"free": 10, "starter": 50, "pro": 200, "elite": 999999}
    plan = org.data.get("plan", "free")
    if count.count >= limits.get(plan, 15):
        raise HTTPException(status_code=403, detail=f"Límite de alumnos alcanzado para el plan {plan}. Actualiza tu plan.")

    member_id = str(uuid.uuid4())
    member = db.table("members").insert({
        "id": member_id,
        "org_id": org_id,
        "nombre": data.nombre,
        "actividad": data.actividad,
        "email": data.email,
        "telefono": data.telefono,
        "notas": data.notas,
        "activo": True,
        "fecha_inscripcion": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return member.data[0]


@router.get("/{member_id}")
async def get_member(member_id: str, org_id: str = Depends(get_current_org)):
    """Obtener alumno con su historial de pagos"""
    db = get_supabase()
    res = db.table("members").select("*, payments(*)").eq("id", member_id).eq("org_id", org_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return res.data


@router.patch("/{member_id}")
async def update_member(member_id: str, data: MemberUpdate, org_id: str = Depends(get_current_org)):
    """Actualizar datos del alumno"""
    db = get_supabase()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Sin datos para actualizar")
    res = db.table("members").update(updates).eq("id", member_id).eq("org_id", org_id).execute()
    return res.data[0]


@router.delete("/{member_id}", status_code=204)
async def delete_member(member_id: str, org_id: str = Depends(get_current_org)):
    """Soft-delete (marca como inactivo, no borra datos)"""
    db = get_supabase()
    db.table("members").update({"activo": False}).eq("id", member_id).eq("org_id", org_id).execute()
    return None

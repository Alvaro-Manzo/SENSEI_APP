from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import OrgUpdate, OrgResponse
from app.core.database import get_supabase
from app.core.security import get_current_user, get_current_org

router = APIRouter()


@router.get("/me", response_model=dict)
async def get_my_org(org_id: str = Depends(get_current_org)):
    """Obtener organización del usuario actual"""
    db = get_supabase()
    res = db.table("organizations").select("*").eq("id", org_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    return res.data


@router.patch("/me")
async def update_my_org(data: OrgUpdate, org_id: str = Depends(get_current_org), current_user: dict = Depends(get_current_user)):
    """Actualizar configuración de la organización (solo owner/admin)"""
    if current_user.get("rol") not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    db = get_supabase()
    updates = data.model_dump(exclude_none=True)
    res = db.table("organizations").update(updates).eq("id", org_id).execute()
    return res.data[0]


@router.get("/me/stats")
async def org_stats(org_id: str = Depends(get_current_org)):
    """Stats rápidas de la organización para el dashboard"""
    db = get_supabase()
    from datetime import datetime
    now = datetime.now()

    total_members = db.table("members").select("id", count="exact").eq("org_id", org_id).eq("activo", True).execute()
    pagos_mes = db.table("payments")\
        .select("monto", count="exact")\
        .eq("org_id", org_id)\
        .eq("mes", now.month)\
        .eq("anio", now.year)\
        .execute()

    total_recaudado_mes = sum(p["monto"] for p in pagos_mes.data)

    return {
        "total_alumnos": total_members.count or 0,
        "pagos_este_mes": pagos_mes.count or 0,
        "recaudado_este_mes": total_recaudado_mes,
        "pendientes_este_mes": max((total_members.count or 0) - (pagos_mes.count or 0), 0),
    }

from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_supabase
from app.core.security import get_current_org
from datetime import datetime

router = APIRouter()

PLAN_RANK = {"free": 0, "starter": 1, "pro": 2, "elite": 3}

def require_plan(db, org_id: str, required: str):
    org = db.table("organizations").select("plan").eq("id", org_id).single().execute()
    plan = org.data.get("plan", "free") if org.data else "free"
    if PLAN_RANK.get(plan, 0) < PLAN_RANK.get(required, 99):
        raise HTTPException(
            status_code=403,
            detail=f"Esta función requiere el plan {required} o superior. Actualiza en /pricing"
        )


@router.get("/annual")
async def annual_report(anio: int = None, org_id: str = Depends(get_current_org)):
    """Reporte anual: recaudación por mes. Requiere plan starter+"""
    db = get_supabase()
    require_plan(db, org_id, "starter")
    anio = anio or datetime.now().year

    pagos = db.table("payments")\
        .select("mes, monto, estado")\
        .eq("org_id", org_id)\
        .eq("anio", anio)\
        .execute()

    meses_data = []
    for i in range(1, 13):
        pagos_mes = [p for p in pagos.data if p["mes"] == i]
        pagados = [p for p in pagos_mes if p.get("estado") == "pagado"]
        pendientes = [p for p in pagos_mes if p.get("estado") != "pagado"]
        meses_data.append({
            "mes": i,
            "pagados": len(pagados),
            "pendientes": len(pendientes),
            "recaudado": sum(p["monto"] for p in pagados),
        })

    return {"anio": anio, "meses": meses_data}


@router.get("/deudores")
async def deudores(meses_minimo: int = 2, org_id: str = Depends(get_current_org)):
    """Alumnos con N o más meses sin pagar"""
    db = get_supabase()
    now = datetime.now()
    mes_actual = now.month
    anio_actual = now.year

    members = db.table("members").select("id, nombre, actividad").eq("org_id", org_id).eq("activo", True).execute()
    pagos = db.table("payments").select("member_id, mes, anio").eq("org_id", org_id).eq("anio", anio_actual).execute()

    pagos_set = {(p["member_id"], p["mes"]) for p in pagos.data}
    deudores_list = []

    for m in members.data:
        meses_sin_pagar = 0
        for mes in range(mes_actual, 0, -1):
            if (m["id"], mes) not in pagos_set:
                meses_sin_pagar += 1
            else:
                break
        if meses_sin_pagar >= meses_minimo:
            deudores_list.append({
                "id": m["id"],
                "nombre": m["nombre"],
                "actividad": m.get("actividad") or "Sin actividad",
                "meses_sin_pagar": meses_sin_pagar,
            })

    deudores_list.sort(key=lambda x: x["meses_sin_pagar"], reverse=True)
    return {"total": len(deudores_list), "deudores": deudores_list}

from fastapi import APIRouter, Depends
from app.core.database import get_supabase
from app.core.security import get_current_org
from datetime import datetime

router = APIRouter()


@router.get("/annual")
async def annual_report(anio: int = None, org_id: str = Depends(get_current_org)):
    """Reporte anual: recaudación por mes"""
    db = get_supabase()
    anio = anio or datetime.now().year

    pagos = db.table("payments")\
        .select("mes, monto, estado")\
        .eq("org_id", org_id)\
        .eq("anio", anio)\
        .execute()

    meses_nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                     "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

    desglose = []
    total_anual = 0
    for i, nombre in enumerate(meses_nombres, 1):
        pagos_mes = [p for p in pagos.data if p["mes"] == i]
        total_mes = sum(p["monto"] for p in pagos_mes)
        total_anual += total_mes
        desglose.append({"mes": nombre, "mes_num": i, "total": total_mes, "pagos": len(pagos_mes)})

    return {"anio": anio, "total_anual": total_anual, "meses": desglose}


@router.get("/deudores")
async def deudores(meses_minimo: int = 2, org_id: str = Depends(get_current_org)):
    """Alumnos con N o más meses sin pagar (consecutivos desde hoy)"""
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
                "actividad": m["actividad"],
                "meses_sin_pagar": meses_sin_pagar,
            })

    deudores_list.sort(key=lambda x: x["meses_sin_pagar"], reverse=True)
    return {"total": len(deudores_list), "deudores": deudores_list}

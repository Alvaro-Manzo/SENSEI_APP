from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import PaymentCreate, PaymentResponse
from app.core.database import get_supabase
from app.core.security import get_current_org
from datetime import datetime, timezone
import uuid

router = APIRouter()

MESES = {1:"Enero",2:"Febrero",3:"Marzo",4:"Abril",5:"Mayo",6:"Junio",
          7:"Julio",8:"Agosto",9:"Septiembre",10:"Octubre",11:"Noviembre",12:"Diciembre"}


@router.get("/")
async def list_payments(
    mes: int = None,
    anio: int = None,
    member_id: str = None,
    org_id: str = Depends(get_current_org)
):
    """Listar pagos filtrados por mes/año/alumno"""
    db = get_supabase()
    query = db.table("payments").select("*, members(nombre, actividad)").eq("org_id", org_id)
    if mes:
        query = query.eq("mes", mes)
    if anio:
        query = query.eq("anio", anio)
    if member_id:
        query = query.eq("member_id", member_id)
    res = query.order("fecha_pago", desc=True).execute()
    return res.data


@router.post("/", status_code=201)
async def create_payment(data: PaymentCreate, org_id: str = Depends(get_current_org)):
    """Registrar un pago"""
    db = get_supabase()

    # Verificar que el alumno pertenece a la org (aislamiento multi-tenant)
    member = db.table("members").select("id").eq("id", data.member_id).eq("org_id", org_id).execute()
    if not member.data:
        raise HTTPException(status_code=404, detail="Alumno no encontrado en tu organización")

    # Verificar si ya existe pago para ese mes/año
    existing = db.table("payments")\
        .select("id")\
        .eq("member_id", data.member_id)\
        .eq("mes", data.mes)\
        .eq("anio", data.anio)\
        .execute()

    payment_data = {
        "org_id": org_id,
        "member_id": data.member_id,
        "mes": data.mes,
        "anio": data.anio,
        "monto": data.monto,
        "estado": data.estado,
        "notas": data.notas,
        "fecha_pago": datetime.now(timezone.utc).isoformat(),
    }

    if existing.data:
        # Actualizar pago existente
        res = db.table("payments").update(payment_data).eq("id", existing.data[0]["id"]).execute()
    else:
        payment_data["id"] = str(uuid.uuid4())
        res = db.table("payments").insert(payment_data).execute()

    return res.data[0]


@router.get("/summary/month")
async def monthly_summary(
    mes: int = None,
    anio: int = None,
    org_id: str = Depends(get_current_org)
):
    """Resumen del mes: total recaudado, pagados, pendientes"""
    db = get_supabase()
    now = datetime.now()
    mes = mes or now.month
    anio = anio or now.year

    # Total alumnos activos
    total_members = db.table("members").select("id", count="exact").eq("org_id", org_id).eq("activo", True).execute()

    # Pagos del mes
    pagos = db.table("payments")\
        .select("monto, estado, member_id")\
        .eq("org_id", org_id)\
        .eq("mes", mes)\
        .eq("anio", anio)\
        .execute()

    total_recaudado = sum(p["monto"] for p in pagos.data)
    pagados = len([p for p in pagos.data if p["estado"] == "pagado"])
    pendientes = (total_members.count or 0) - pagados

    return {
        "mes": MESES.get(mes),
        "anio": anio,
        "total_alumnos": total_members.count or 0,
        "pagados": pagados,
        "pendientes": max(pendientes, 0),
        "total_recaudado": total_recaudado,
    }

#!/usr/bin/env python3
"""
🤖 SENSEI BOT - Multi-tenant
Cada organización tiene su propio token de Telegram.
Este proceso corre una instancia del bot para UNA org.
Se lanza via Docker con variable de entorno ORG_ID.
"""
import os
import logging
import unicodedata
import json
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
import httpx

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# ── Config ─────────────────────────────────────────────────────────────────────
API_BASE = os.getenv("API_BASE_URL", "http://backend:8000/api")
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ORG_ID    = os.getenv("ORG_ID", "")
BOT_SECRET = os.getenv("BOT_SECRET", "")   # token interno bot↔API

MESES_ES = {1:"enero",2:"febrero",3:"marzo",4:"abril",5:"mayo",6:"junio",
             7:"julio",8:"agosto",9:"septiembre",10:"octubre",11:"noviembre",12:"diciembre"}


def normalizar(texto: str) -> str:
    nfkd = unicodedata.normalize("NFKD", str(texto))
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower().strip()


async def api_get(path: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{API_BASE}{path}", headers={"X-Bot-Secret": BOT_SECRET, "X-Org-Id": ORG_ID})
        r.raise_for_status()
        return r.json()


async def api_post(path: str, body: dict) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{API_BASE}{path}", json=body, headers={"X-Bot-Secret": BOT_SECRET, "X-Org-Id": ORG_ID})
        r.raise_for_status()
        return r.json()


# ── Comandos ───────────────────────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    stats = await api_get("/orgs/me/stats")
    org   = await api_get("/orgs/me")
    mes   = MESES_ES[datetime.now().month].upper()
    msg = (
        f"🏫 <b>{org['nombre']}</b> — {org['deporte']}\n\n"
        f"📊 <b>Resumen {mes}:</b>\n"
        f"👥 Alumnos: <b>{stats['total_alumnos']}</b>\n"
        f"✅ Pagaron: <b>{stats['pagos_este_mes']}</b>\n"
        f"⏳ Deben: <b>{stats['pendientes_este_mes']}</b>\n"
        f"💰 Recaudado: <b>${stats['recaudado_este_mes']:,.2f}</b>\n\n"
        f"💡 <i>Usa /ayuda para ver todos los comandos</i>"
    )
    keyboard = [
        [InlineKeyboardButton("👥 Alumnos", callback_data="lista"),
         InlineKeyboardButton("💰 Registrar pago", callback_data="pago_info")],
        [InlineKeyboardButton("📊 Estadísticas", callback_data="stats"),
         InlineKeyboardButton("⚠️ Deudores", callback_data="deudores")],
    ]
    await update.message.reply_html(msg, reply_markup=InlineKeyboardMarkup(keyboard))


async def registrar_pago(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Formatos:
      /pago Nombre, cantidad, estado          ← mes actual automático
      /pago Nombre, mes, cantidad, estado     ← mes explícito
    """
    texto = update.message.text.replace("/pago", "").replace("/p", "").strip()
    if not texto:
        await update.message.reply_html(
            "💰 <b>Registrar pago</b>\n\n"
            "Formato rápido (mes actual):\n<code>/pago Nombre, cantidad, estado</code>\n\n"
            "Formato completo:\n<code>/pago Nombre, mes, cantidad, estado</code>\n\n"
            "Ejemplo:\n<code>/pago Juan García, 800, pagado</code>"
        )
        return

    partes = [p.strip() for p in texto.split(",")]
    mes_actual = MESES_ES[datetime.now().month]

    if len(partes) == 3:
        nombre, cantidad_str, estado = partes
        mes = mes_actual
    elif len(partes) == 4:
        nombre, mes, cantidad_str, estado = partes
    else:
        await update.message.reply_text("❌ Formato incorrecto. Usa: /pago Nombre, cantidad, estado")
        return

    # Buscar alumno
    members = await api_get("/members/")
    encontrado = next((m for m in members if normalizar(nombre) in normalizar(m["nombre"])), None)
    if not encontrado:
        await update.message.reply_html(f"❌ Alumno <b>{nombre}</b> no encontrado.\nUsa /lista para ver todos.")
        return

    try:
        monto = float(cantidad_str.replace("$", "").replace(",", "").strip())
    except ValueError:
        await update.message.reply_text("❌ La cantidad debe ser un número. Ej: 800")
        return

    meses_idx = {v: k for k, v in MESES_ES.items()}
    mes_num = meses_idx.get(normalizar(mes))
    if not mes_num:
        await update.message.reply_text(f"❌ Mes inválido: {mes}")
        return

    pago = await api_post("/payments/", {
        "member_id": encontrado["id"],
        "mes": mes_num,
        "anio": datetime.now().year,
        "monto": monto,
        "estado": estado.lower(),
    })

    emoji = "✅" if estado.lower() == "pagado" else "⏳"
    await update.message.reply_html(
        f"{emoji} <b>Pago registrado</b>\n\n"
        f"👤 {encontrado['nombre']}\n"
        f"📅 {MESES_ES[mes_num].capitalize()} {datetime.now().year}\n"
        f"💵 ${monto:,.2f}\n"
        f"Estado: {estado.capitalize()}"
    )


async def lista_alumnos(update: Update, context: ContextTypes.DEFAULT_TYPE):
    members = await api_get("/members/")
    if not members:
        await update.message.reply_text("No hay alumnos registrados.")
        return
    msg = f"👥 <b>ALUMNOS ({len(members)})</b>\n\n"
    for i, m in enumerate(members, 1):
        msg += f"{i}. {m['nombre']} — {m.get('actividad','')}\n"
    await update.message.reply_html(msg)


async def stats_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    stats = await api_get("/orgs/me/stats")
    reporte = await api_get("/reports/annual")
    deudores = await api_get("/reports/deudores")

    msg = (
        f"📊 <b>ESTADÍSTICAS</b>\n\n"
        f"👥 Total alumnos: <b>{stats['total_alumnos']}</b>\n"
        f"💰 Este mes: <b>${stats['recaudado_este_mes']:,.2f}</b>\n"
        f"📅 Total año: <b>${reporte['total_anual']:,.2f}</b>\n\n"
        f"<b>Por mes:</b>\n"
    )
    for m in reporte["meses"]:
        if m["total"] > 0:
            msg += f"  {m['mes'][:3]}: ${m['total']:,.0f}\n"

    if deudores["total"] > 0:
        msg += f"\n⚠️ <b>Deudores 2+ meses: {deudores['total']}</b>\n"
        for d in deudores["deudores"][:5]:
            msg += f"  • {d['nombre']} ({d['meses_sin_pagar']} meses)\n"

    await update.message.reply_html(msg)


async def buscar_alumno(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("Uso: /buscar Nombre")
        return
    query = " ".join(context.args)
    members = await api_get("/members/")
    encontrados = [m for m in members if normalizar(query) in normalizar(m["nombre"])]
    if not encontrados:
        await update.message.reply_html(f"❌ Sin resultados para <b>{query}</b>")
        return

    msg = f"🔍 <b>Resultados para '{query}'</b>\n\n"
    for m in encontrados:
        detalle = await api_get(f"/members/{m['id']}")
        pagos = detalle.get("payments", [])
        meses_pagados = len([p for p in pagos if p.get("monto", 0) > 0])
        barra = "█" * meses_pagados + "░" * (12 - meses_pagados)
        msg += (
            f"<b>{m['nombre']}</b>\n"
            f"🏅 {m.get('actividad','')}\n"
            f"📊 <code>{barra}</code> {meses_pagados}/12\n\n"
        )
    await update.message.reply_html(msg)


async def ayuda(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = (
        "🤖 <b>COMANDOS DISPONIBLES</b>\n\n"
        "<code>/start</code> — Panel principal\n"
        "<code>/pago</code> o <code>/p</code> — Registrar pago\n"
        "<code>/lista</code> — Ver todos los alumnos\n"
        "<code>/buscar Nombre</code> — Buscar alumno\n"
        "<code>/stats</code> — Estadísticas\n"
        "<code>/ayuda</code> — Esta ayuda\n"
    )
    await update.message.reply_html(msg)


async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if query.data == "lista":
        members = await api_get("/members/")
        msg = f"👥 <b>ALUMNOS ({len(members)})</b>\n\n"
        for i, m in enumerate(members, 1):
            msg += f"{i}. {m['nombre']} — {m.get('actividad','')}\n"
        await query.edit_message_text(msg, parse_mode="HTML")
    elif query.data == "stats":
        await stats_cmd(update, context)
    elif query.data == "deudores":
        d = await api_get("/reports/deudores")
        msg = f"⚠️ <b>DEUDORES ({d['total']})</b>\n\n"
        for x in d["deudores"]:
            msg += f"• {x['nombre']} — {x['meses_sin_pagar']} meses\n"
        await query.edit_message_text(msg or "✅ Sin deudores", parse_mode="HTML")


def main():
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN no definido")
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler(["pago", "p"], registrar_pago))
    app.add_handler(CommandHandler("lista", lista_alumnos))
    app.add_handler(CommandHandler("buscar", buscar_alumno))
    app.add_handler(CommandHandler(["stats", "estadisticas"], stats_cmd))
    app.add_handler(CommandHandler("ayuda", ayuda))
    app.add_handler(CallbackQueryHandler(button_handler))
    print(f"🤖 Bot iniciado | ORG: {ORG_ID}")
    app.run_polling()


if __name__ == "__main__":
    main()

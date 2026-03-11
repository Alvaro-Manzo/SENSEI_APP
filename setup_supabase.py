#!/usr/bin/env python3
"""
setup_supabase.py — Configura las keys de Supabase en backend/.env
Uso: python3 setup_supabase.py
"""
import os
import re
import subprocess

BACKEND_ENV = os.path.join(os.path.dirname(__file__), "backend", ".env")

print("=" * 60)
print("  🥋 SENSEI APP — Configuración de Supabase")
print("=" * 60)
print()
print("Pasos en https://supabase.com/dashboard:")
print("  1. New project → elige nombre y región (USA East recomendado)")
print("  2. Espera ~2 min que inicialice")
print("  3. Settings → API → copia Project URL y service_role key")
print()

url = input("📋 Pega tu SUPABASE_URL (ej: https://xxxx.supabase.co): ").strip()
key = input("📋 Pega tu service_role KEY: ").strip()

if not url.startswith("https://") or not key:
    print("❌ Valores inválidos. Intenta de nuevo.")
    exit(1)

# Leer .env actual
with open(BACKEND_ENV, "r") as f:
    content = f.read()

# Reemplazar los placeholders
content = re.sub(r"SUPABASE_URL=.*", f"SUPABASE_URL={url}", content)
content = re.sub(r"SUPABASE_SERVICE_ROLE_KEY=.*", f"SUPABASE_SERVICE_ROLE_KEY={key}", content)

# Generar SECRET_KEY real
import secrets
secret = secrets.token_hex(32)
content = re.sub(r"SECRET_KEY=.*", f"SECRET_KEY={secret}", content)

with open(BACKEND_ENV, "w") as f:
    f.write(content)

print()
print("✅ backend/.env actualizado")
print()
print("Ahora aplica el schema SQL:")
print("  1. Ve a Supabase Dashboard → SQL Editor")
print("  2. Pega el contenido de infra/schema.sql")
print("  3. Click 'Run'")
print()
print("Luego reinicia el backend:")
print("  cd backend && source venv/bin/activate")
print("  uvicorn app.main:app --reload")
print()
print("🚀 ¡Listo para registrar tu primera academia en http://localhost:3000/register!")

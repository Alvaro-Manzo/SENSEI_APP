from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.routers import auth, orgs, members, payments, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.APP_NAME} API iniciando...")
    yield
    print("🛑 API apagando...")

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Sistema multi-tenant de gestión de alumnos para academias deportivas",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — permite frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(orgs.router,     prefix="/api/orgs",     tags=["Organizaciones"])
app.include_router(members.router,  prefix="/api/members",  tags=["Alumnos"])
app.include_router(payments.router, prefix="/api/payments", tags=["Pagos"])
app.include_router(reports.router,  prefix="/api/reports",  tags=["Reportes"])

@app.get("/")
async def root():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

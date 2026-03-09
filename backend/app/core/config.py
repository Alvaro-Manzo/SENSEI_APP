from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Sensei"
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Email
    SENDGRID_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@sensei.app"

    class Config:
        env_file = ".env"

settings = Settings()

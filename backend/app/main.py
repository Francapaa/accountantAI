from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.me import router as me_router
from app.api.whatsapp import router as whatsapp_api_router
from app.core.config import settings
from app.whatsapp.webhook import router as whatsapp_webhook_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AccountantAI — API de RAG sobre normativa ARCA/AFIP",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name}

@app.get("/")
def response() -> dict[str, str]:
    return {"status": "ok", "message": "FUNCA PAAA"}

app.include_router(me_router)
app.include_router(whatsapp_api_router)
app.include_router(whatsapp_webhook_router)
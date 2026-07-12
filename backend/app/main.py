from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.limiter import limiter
from app.routers import admin, auth, avaliacoes, favoritos, imoveis, referencias, usuarios

app = FastAPI(title="AlugaAlegre API")

# Rate limiting (slowapi): registra o limiter e o handler que responde 429.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(imoveis.router)
app.include_router(avaliacoes.router)
app.include_router(favoritos.router)
app.include_router(referencias.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}

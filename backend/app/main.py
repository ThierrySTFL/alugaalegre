from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, favoritos, imoveis, usuarios

app = FastAPI(title="AlugaAlegre API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(imoveis.router)
app.include_router(favoritos.router)


@app.get("/health")
def health():
    return {"status": "ok"}

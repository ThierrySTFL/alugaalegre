from fastapi import FastAPI

from app.routers import auth, favoritos, imoveis, usuarios

app = FastAPI(title="AlugaAlegre API")

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(imoveis.router)
app.include_router(favoritos.router)


@app.get("/health")
def health():
    return {"status": "ok"}

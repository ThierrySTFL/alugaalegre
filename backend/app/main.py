from fastapi import FastAPI

app = FastAPI(title="AlugaAlegre API")


@app.get("/health")
def health():
    return {"status": "ok"}

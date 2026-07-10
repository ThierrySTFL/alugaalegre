from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter compartilhado. Storage em memória (por processo) — suficiente
# para dev e um único worker. Em produção com vários workers, apontar para um
# backend compartilhado (ex.: Redis) via storage_uri="redis://...".
limiter = Limiter(key_func=get_remote_address)

import React from "react";
// Painel do administrador — lista de denúncias (abertas primeiro). O admin
// julga cada uma: procedente (pausa o anúncio) ou improcedente (só fecha).
// Dados vindos de GET /admin/denuncias; ações via PATCH /admin/denuncias/{id}.

const formatData = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_MAP = {
  A: { label: "Aberta", className: "pill sun" },
  R: { label: "Procedente", className: "pill", color: "var(--success)" },
  I: { label: "Improcedente", className: "pill", color: "var(--ink-3)" },
};

const AdminPanel = ({ showToast, openProperty }) => {
  const [denuncias, setDenuncias] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [busyId, setBusyId] = React.useState(null);

  const carregar = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDenuncias(await window.api.listarDenunciasAdmin());
    } catch (err) {
      setError(err.message || "Não foi possível carregar as denúncias.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const resolver = async (denuncia, desfecho) => {
    setBusyId(denuncia.iddenuncia);
    try {
      const atualizada = await window.api.resolverDenuncia(denuncia.iddenuncia, desfecho);
      setDenuncias((prev) =>
        prev.map((d) => (d.iddenuncia === atualizada.iddenuncia ? atualizada : d))
      );
      showToast?.(
        desfecho === "procedente"
          ? "Denúncia marcada como procedente — anúncio pausado."
          : "Denúncia marcada como improcedente."
      );
    } catch (err) {
      showToast?.(err.message || "Não foi possível atualizar a denúncia.");
    } finally {
      setBusyId(null);
    }
  };

  // Anúncios pausados (denúncia já julgada procedente) não aparecem mais no
  // detalhe público (GET /imoveis/{id} só devolve status "A") — nesse caso
  // avisamos em vez de deixar o link quebrar em silêncio.
  const abrirAnuncio = async (denuncia) => {
    try {
      const anuncio = await window.api.detalheImovel(denuncia.idanuncio);
      openProperty(window.adaptAnuncio(anuncio));
    } catch {
      showToast?.("Esse anúncio não está mais disponível para visualização.");
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: "80px 32px", textAlign: "center" }}>
        <span className="spinner" style={{ width: 28, height: 28, color: "var(--accent)" }} />
        <p className="muted" style={{ marginTop: 16 }}>Carregando denúncias…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ padding: "80px 32px", textAlign: "center" }}>
        <p className="muted">{error}</p>
        <button className="btn ghost sm" style={{ marginTop: 16 }} onClick={carregar}>Tentar de novo</button>
      </main>
    );
  }

  const abertas = denuncias.filter((d) => d.status === "A").length;

  return (
    <main className="container" style={{ padding: "40px 32px 80px" }}>
      <header>
        <span className="mono" style={{ color: "var(--accent)" }}>● Painel do administrador</span>
        <h1 style={{ fontSize: 36, marginTop: 10, letterSpacing: "-0.02em" }}>Denúncias</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
          {abertas === 0
            ? "Nenhuma denúncia em aberto."
            : `${abertas} denúncia${abertas > 1 ? "s" : ""} em aberto.`}
        </p>
      </header>

      <section style={{ marginTop: 32 }}>
        {denuncias.length === 0 ? (
          <div className="empty">
            <p style={{ margin: 0, fontSize: 15 }}>Nenhuma denúncia registrada ainda.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="table-scroll">
              <div style={{
                display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.9fr 0.9fr 230px",
                padding: "14px 20px", borderBottom: "1px solid var(--line)",
                fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                <span>Descrição</span>
                <span>Anúncio</span>
                <span>Denunciante</span>
                <span>Data</span>
                <span>Status</span>
                <span></span>
              </div>
              {denuncias.map((d) => (
                <AdminDenunciaRow
                  key={d.iddenuncia}
                  denuncia={d}
                  busy={busyId === d.iddenuncia}
                  onAbrirAnuncio={() => abrirAnuncio(d)}
                  onProcedente={() => resolver(d, "procedente")}
                  onImprocedente={() => resolver(d, "improcedente")}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

const AdminDenunciaRow = ({ denuncia, busy, onAbrirAnuncio, onProcedente, onImprocedente }) => {
  const s = STATUS_MAP[denuncia.status] || STATUS_MAP.A;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.9fr 0.9fr 230px",
      padding: "14px 20px", borderBottom: "1px solid var(--line)",
      alignItems: "center", opacity: busy ? 0.6 : 1,
    }}>
      <div style={{ fontSize: 14 }}>{denuncia.descricao}</div>
      <div style={{ fontSize: 14, minWidth: 0 }}>
        <a
          onClick={onAbrirAnuncio}
          style={{
            cursor: "pointer", color: "var(--accent)", textDecoration: "underline",
            display: "inline-block", maxWidth: "100%", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {denuncia.anuncio_titulo || "Anúncio removido"}
        </a>
      </div>
      <div style={{ fontSize: 14 }}>{denuncia.denunciante_nome}</div>
      <div className="mono muted" style={{ fontSize: 12 }}>{formatData(denuncia.datadenuncia)}</div>
      <div>
        <span className={s.className} style={s.color ? { color: s.color } : undefined}>{s.label}</span>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {denuncia.status === "A" && (
          <>
            <button
              className="btn ghost sm"
              style={{ color: "var(--success)", borderColor: "var(--success)" }}
              onClick={onProcedente}
              disabled={busy}
            >
              <Icon name="check" size={13} /> Procedente
            </button>
            <button
              className="btn ghost sm"
              style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
              onClick={onImprocedente}
              disabled={busy}
            >
              <Icon name="close" size={13} /> Improcedente
            </button>
          </>
        )}
      </div>
    </div>
  );
};

window.AdminPanel = AdminPanel;

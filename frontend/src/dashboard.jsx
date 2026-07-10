import React from "react";
// Landlord dashboard — manage listings (medium-density table)
// Dados vindos de GET /meus-imoveis e GET /meus-contatos.

const formatDataContato = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const Dashboard = ({ session, navigate, openProperty, showToast }) => {
  const [listings, setListings] = React.useState([]);
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [tab, setTab] = React.useState("all"); // all / active / inactive
  const [menuOpen, setMenuOpen] = React.useState(null);
  const [busyId, setBusyId] = React.useState(null);
  const [editing, setEditing] = React.useState(null); // listing sendo editado

  const carregar = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [imoveis, contatos] = await Promise.all([
        window.api.meusImoveis(),
        window.api.meusContatos(),
      ]);
      setListings(imoveis.map(window.adaptAnuncio));
      setContacts(contatos);
    } catch (err) {
      setError(err.message || "Não foi possível carregar seu painel.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { carregar(); }, [carregar]);

  const filtered = listings.filter((l) => tab === "all" || l.status === tab);

  const stats = React.useMemo(() => ({
    total: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    contacts: contacts.length,
  }), [listings, contacts]);

  const toggleStatus = async (listing) => {
    setMenuOpen(null);
    setBusyId(listing.id);
    try {
      const novoStatus = listing.status === "active" ? "P" : "A";
      const atualizado = await window.api.editarImovel(listing.id, { status: novoStatus });
      setListings((prev) => prev.map((l) => (l.id === listing.id ? window.adaptAnuncio(atualizado) : l)));
      showToast?.(novoStatus === "A" ? "Imóvel ativado" : "Imóvel pausado");
    } catch (err) {
      showToast?.(err.message || "Não foi possível atualizar o status.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteListing = async (listing) => {
    setMenuOpen(null);
    if (!confirm("Excluir este imóvel? Essa ação não pode ser desfeita.")) return;
    setBusyId(listing.id);
    try {
      await window.api.excluirImovel(listing.id);
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
      // O backend também apaga os contatos do anúncio (cascade) — reflete aqui.
      setContacts((prev) => prev.filter((c) => c.idanuncio !== listing.id));
      showToast?.("Imóvel excluído");
    } catch (err) {
      showToast?.(err.message || "Não foi possível excluir o imóvel.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveEdit = (atualizado) => {
    setListings((prev) => prev.map((l) => (l.id === atualizado.id ? atualizado : l)));
    setEditing(null);
    showToast?.("Imóvel atualizado");
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: "80px 32px", textAlign: "center" }}>
        <span className="spinner" style={{ width: 28, height: 28, color: "var(--accent)" }} />
        <p className="muted" style={{ marginTop: 16 }}>Carregando seu painel…</p>
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

  return (
    <main className="container" style={{ padding: "40px 32px 80px" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
        <div>
          <span className="mono" style={{ color: "var(--accent)" }}>● Painel do locador</span>
          <h1 style={{ fontSize: 36, marginTop: 10, letterSpacing: "-0.02em" }}>
            Olá, {session.name.split(" ")[0]}.
          </h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
            Gerencie seus imóveis, ative, pause ou edite a qualquer momento.
          </p>
        </div>
        <button className="btn" onClick={() => navigate("add")}>
          <Icon name="plus" size={14} stroke={2} /> Adicionar imóvel
        </button>
      </header>

      {/* Stats */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 32 }}>
        {[
          { l: "Imóveis cadastrados", v: stats.total, hint: `${stats.active} ativos` },
          { l: "Contatos recebidos", v: stats.contacts, hint: "no total" },
        ].map((s) => (
          <div key={s.l} className="card" style={{ padding: 20 }}>
            <span className="mono muted">{s.l}</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginTop: 8, letterSpacing: "-0.02em" }}>
              {s.v}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{s.hint}</div>
          </div>
        ))}
      </section>

      {/* Listings table */}
      <section style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18 }}>Seus imóveis</h2>
          <div className="tabs">
            {[
              { id: "all", l: `Todos (${listings.length})` },
              { id: "active", l: `Ativos (${listings.filter(l => l.status === "active").length})` },
              { id: "inactive", l: `Pausados (${listings.filter(l => l.status === "inactive").length})` },
            ].map((t) => (
              <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>{t.l}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <p style={{ margin: 0, fontSize: 15 }}>Nenhum imóvel nesta categoria.</p>
            <button className="btn ghost sm" style={{ marginTop: 16 }} onClick={() => navigate("add")}>
              <Icon name="plus" size={14} /> Adicionar imóvel
            </button>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            {/* Table head */}
            <div style={{
              display: "grid", gridTemplateColumns: "minmax(320px, 2.4fr) 1fr 0.8fr 0.8fr 40px",
              padding: "14px 20px", borderBottom: "1px solid var(--line)",
              fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              <span>Imóvel</span>
              <span>Localização</span>
              <span>Preço</span>
              <span>Status</span>
              <span></span>
            </div>
            {filtered.map((l) => (
              <DashboardRow
                key={l.id}
                listing={l}
                busy={busyId === l.id}
                menuOpen={menuOpen === l.id}
                setMenuOpen={(v) => setMenuOpen(v ? l.id : null)}
                onEdit={() => { setEditing(l); setMenuOpen(null); }}
                onToggleStatus={() => toggleStatus(l)}
                onDelete={() => deleteListing(l)}
                onView={() => openProperty(l)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent contacts */}
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Contatos recentes</h2>
        {contacts.length === 0 ? (
          <div className="empty">
            <p style={{ margin: 0, fontSize: 15 }}>Nenhum contato recebido ainda.</p>
          </div>
        ) : (
          <div className="card">
            {contacts.map((c, i, arr) => (
              <div key={c.idcontato} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={c.cliente_nome} size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.cliente_nome}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      Se interessou por "{c.anuncio_titulo || "imóvel removido"}"
                    </div>
                  </div>
                </div>
                <span className="mono muted">{formatDataContato(c.datacontato)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <EditListingModal listing={editing} onClose={() => setEditing(null)} onSaved={handleSaveEdit} />
      )}
    </main>
  );
};

const DashboardRow = ({ listing, busy, menuOpen, setMenuOpen, onEdit, onToggleStatus, onDelete, onView }) => {
  const statusMap = {
    active: { label: "Ativo", className: "pill dot", color: "var(--success)" },
    inactive: { label: "Pausado", className: "pill", color: "var(--ink-3)" },
  };
  const s = statusMap[listing.status] || statusMap.inactive;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "minmax(320px, 2.4fr) 1fr 0.8fr 0.8fr 40px",
      padding: "14px 20px", borderBottom: "1px solid var(--line)",
      alignItems: "center", position: "relative", opacity: busy ? 0.6 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 72, height: 54, flexShrink: 0 }}>
          <Photo src={listing.coverUrl} alt={listing.title} label="" style={{ height: "100%", padding: 0 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {listing.title}
          </div>
          <div className="mono muted" style={{ marginTop: 4 }}>
            {listing.type.toUpperCase()} · {listing.bedrooms}Q · {listing.area}m²
          </div>
        </div>
      </div>
      <div style={{ fontSize: 14 }}>
        {listing.neighborhood}
        <div className="muted" style={{ fontSize: 12 }}>{listing.city.split(",")[1]?.trim()}</div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {fmtBRL(listing.price)}
        <div className="muted" style={{ fontSize: 11, fontWeight: 400, fontFamily: "var(--font-body)" }}>/mês</div>
      </div>
      <div>
        <span className={s.className} style={{ color: s.color }}>{s.label}</span>
      </div>
      <button className="btn ghost icon sm" onClick={() => setMenuOpen(!menuOpen)} style={{ border: "none" }} disabled={busy}>
        <Icon name="more" size={16} />
      </button>
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
          <div style={{
            position: "absolute", top: 50, right: 16, zIndex: 10,
            background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8,
            minWidth: 180, boxShadow: "0 12px 28px rgba(0,0,0,0.12)", padding: 6,
          }}>
            {[
              { i: "eye", l: "Visualizar", on: onView },
              { i: "edit", l: "Editar", on: onEdit },
              { i: listing.status === "active" ? "eye-off" : "eye", l: listing.status === "active" ? "Pausar" : "Ativar", on: onToggleStatus },
              { i: "trash", l: "Excluir", on: onDelete, danger: true },
            ].map((opt) => (
              <button key={opt.l} onClick={opt.on}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 12px", background: "transparent", border: "none",
                  fontSize: 13, color: opt.danger ? "var(--danger)" : "var(--ink)",
                  borderRadius: 4, textAlign: "left", cursor: "pointer",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Icon name={opt.i} size={14} /> {opt.l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Edição rápida — PATCH /imoveis/{id} só cobre título/preço/descrição/quartos/
// banheiros/área/status; endereço, fotos e comodidades exigiriam recriar o
// anúncio, então ficam fora deste formulário.
const EditListingModal = ({ listing, onClose, onSaved }) => {
  const [titulo, setTitulo] = React.useState(listing.title || "");
  const [preco, setPreco] = React.useState(String(listing.price ?? ""));
  const [descricao, setDescricao] = React.useState(listing.description || "");
  const [quartos, setQuartos] = React.useState(listing.bedrooms ?? 0);
  const [banheiros, setBanheiros] = React.useState(listing.bathrooms ?? 0);
  const [area, setArea] = React.useState(String(listing.area ?? ""));
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [erroGeral, setErroGeral] = React.useState(null);

  const salvar = async () => {
    const e = {};
    if (!titulo.trim()) e.titulo = "Informe um título.";
    if (!preco || parseFloat(preco) <= 0) e.preco = "Informe um preço válido.";
    if (!descricao.trim()) e.descricao = "Informe uma descrição.";
    if (!area || parseFloat(area) <= 0) e.area = "Informe a área em m².";
    setErrors(e);
    setErroGeral(null);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const atualizado = await window.api.editarImovel(listing.id, {
        titulo: titulo.trim(),
        preco: parseFloat(preco),
        descricao: descricao.trim(),
        quartos,
        banheiros,
        area: parseFloat(area),
      });
      onSaved(window.adaptAnuncio(atualizado));
    } catch (err) {
      setErroGeral(err.message || "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono" style={{ color: "var(--accent)" }}>● Editar imóvel</span>
          <button className="btn ghost icon sm" onClick={onClose}><Icon name="close" size={14} /></button>
        </div>
        <h2 style={{ fontSize: 20, letterSpacing: "-0.02em", marginTop: 12 }}>{listing.title}</h2>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label>Título<span className="req">*</span></label>
          <input className={"input" + (errors.titulo ? " invalid" : "")} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          {errors.titulo && <span className="err">{errors.titulo}</span>}
        </div>
        <div className="field">
          <label>Descrição<span className="req">*</span></label>
          <textarea className={"textarea" + (errors.descricao ? " invalid" : "")} rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          {errors.descricao && <span className="err">{errors.descricao}</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field">
            <label>Aluguel mensal (R$)<span className="req">*</span></label>
            <input className={"input" + (errors.preco ? " invalid" : "")} type="number" value={preco} onChange={(e) => setPreco(e.target.value)} />
            {errors.preco && <span className="err">{errors.preco}</span>}
          </div>
          <div className="field">
            <label>Área (m²)<span className="req">*</span></label>
            <input className={"input" + (errors.area ? " invalid" : "")} type="number" value={area} onChange={(e) => setArea(e.target.value)} />
            {errors.area && <span className="err">{errors.area}</span>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field">
            <label>Quartos</label>
            <input className="input" type="number" min={0} value={quartos} onChange={(e) => setQuartos(Math.max(0, parseInt(e.target.value, 10) || 0))} />
          </div>
          <div className="field">
            <label>Banheiros</label>
            <input className="input" type="number" min={0} value={banheiros} onChange={(e) => setBanheiros(Math.max(0, parseInt(e.target.value, 10) || 0))} />
          </div>
        </div>

        {erroGeral && <div className="err" style={{ fontSize: 13 }}>{erroGeral}</div>}

        <button className="btn accent lg" style={{ width: "100%", marginTop: 4 }} onClick={salvar} disabled={saving}>
          {saving ? <><span className="spinner" /> Salvando…</> : "Salvar alterações"}
        </button>
      </div>
    </ModalShell>
  );
};

window.Dashboard = Dashboard;

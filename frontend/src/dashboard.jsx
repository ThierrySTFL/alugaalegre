import React from "react";
// Landlord dashboard — manage listings (medium-density table)

const Dashboard = ({ session, navigate, ownListings, setOwnListings, openProperty }) => {
  const [tab, setTab] = React.useState("all"); // all / active / inactive / draft
  const [menuOpen, setMenuOpen] = React.useState(null);

  const filtered = ownListings.filter((l) => tab === "all" || l.status === tab);

  const stats = React.useMemo(() => ({
    total: ownListings.length,
    active: ownListings.filter((l) => l.status === "active").length,
    views: 247,
    contacts: 11,
  }), [ownListings]);

  const toggleStatus = (id) => {
    setOwnListings((prev) => prev.map((l) =>
      l.id === id ? { ...l, status: l.status === "active" ? "inactive" : "active" } : l
    ));
    setMenuOpen(null);
  };

  const deleteListing = (id) => {
    if (!confirm("Excluir este imóvel? Essa ação não pode ser desfeita.")) return;
    setOwnListings((prev) => prev.filter((l) => l.id !== id));
    setMenuOpen(null);
  };

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
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 32 }}>
        {[
          { l: "Imóveis cadastrados", v: stats.total, hint: `${stats.active} ativos` },
          { l: "Visualizações (30d)", v: stats.views, hint: "+18% vs mês anterior" },
          { l: "Contatos recebidos", v: stats.contacts, hint: "4 não respondidos" },
          { l: "Tempo médio resposta", v: "3h", hint: "Top 15% locadores" },
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
              { id: "all", l: `Todos (${ownListings.length})` },
              { id: "active", l: `Ativos (${ownListings.filter(l => l.status === "active").length})` },
              { id: "inactive", l: `Pausados (${ownListings.filter(l => l.status === "inactive").length})` },
              { id: "draft", l: `Rascunhos (${ownListings.filter(l => l.status === "draft").length})` },
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
              display: "grid", gridTemplateColumns: "minmax(320px, 2.4fr) 1fr 0.8fr 0.8fr 0.8fr 40px",
              padding: "14px 20px", borderBottom: "1px solid var(--line)",
              fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              <span>Imóvel</span>
              <span>Localização</span>
              <span>Preço</span>
              <span>Visualizações</span>
              <span>Status</span>
              <span></span>
            </div>
            {filtered.map((l) => (
              <DashboardRow
                key={l.id}
                listing={l}
                menuOpen={menuOpen === l.id}
                setMenuOpen={(v) => setMenuOpen(v ? l.id : null)}
                onToggleStatus={() => toggleStatus(l.id)}
                onDelete={() => deleteListing(l.id)}
                onView={() => openProperty(l)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent contacts */}
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Contatos recentes</h2>
        <div className="card">
          {[
            { name: "Júlia Mendes", listing: "Apartamento amplo na Vila Madalena", time: "há 2h", responded: false },
            { name: "Roberto Lima", listing: "Loft industrial em Curitiba", time: "ontem", responded: true },
            { name: "Tatiana Cruz", listing: "Apartamento amplo na Vila Madalena", time: "há 3 dias", responded: true },
          ].map((c, i, arr) => (
            <div key={c.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={c.name} size={36} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>Se interessou por "{c.listing}"</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span className="mono muted">{c.time}</span>
                {c.responded ? (
                  <span className="pill"><Icon name="check" size={11} /> Respondido</span>
                ) : (
                  <button className="btn sm">
                    <Icon name="whatsapp" size={13} /> Responder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

const DashboardRow = ({ listing, menuOpen, setMenuOpen, onToggleStatus, onDelete, onView }) => {
  const statusMap = {
    active: { label: "Ativo", className: "pill dot", color: "var(--success)" },
    inactive: { label: "Pausado", className: "pill", color: "var(--ink-3)" },
    draft: { label: "Rascunho", className: "pill sun", color: "var(--sun)" },
  };
  const s = statusMap[listing.status];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "minmax(320px, 2.4fr) 1fr 0.8fr 0.8fr 0.8fr 40px",
      padding: "14px 20px", borderBottom: "1px solid var(--line)",
      alignItems: "center", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 72, height: 54, flexShrink: 0 }}>
          <Photo label="" style={{ height: "100%", padding: 0 }} />
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
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {Math.floor(Math.random() * 80 + 12)}
        </span>
        <div className="muted" style={{ fontSize: 11 }}>últimos 7 dias</div>
      </div>
      <div>
        <span className={s.className} style={{ color: s.color }}>{s.label}</span>
      </div>
      <button className="btn ghost icon sm" onClick={() => setMenuOpen(!menuOpen)} style={{ border: "none" }}>
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
              { i: "edit", l: "Editar", on: () => { alert("Editor inline — fora do escopo deste protótipo."); setMenuOpen(false); } },
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

window.Dashboard = Dashboard;

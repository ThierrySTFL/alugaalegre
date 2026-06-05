import React from "react";
// Public home — hero, filters, grid

const Home = ({ navigate, openProperty, favorites, toggleFavorite }) => {
  const { LISTINGS, CITIES, TYPES } = window.DATA;
  const [query, setQuery] = React.useState("");
  const [city, setCity] = React.useState("");
  const [type, setType] = React.useState("");
  const [bedrooms, setBedrooms] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState(5000);
  const [showFilters, setShowFilters] = React.useState(false);

  const visible = React.useMemo(() => {
    return LISTINGS.filter((l) => l.status === "active").filter((l) => {
      if (query) {
        const q = query.toLowerCase();
        if (!l.title.toLowerCase().includes(q) &&
        !l.neighborhood.toLowerCase().includes(q) &&
        !l.city.toLowerCase().includes(q)) return false;
      }
      if (city && l.city !== city) return false;
      if (type && l.type !== type) return false;
      if (bedrooms) {
        const b = parseInt(bedrooms, 10);
        if (b === 4 ? l.bedrooms < 4 : l.bedrooms !== b) return false;
      }
      if (l.price > maxPrice) return false;
      return true;
    });
  }, [query, city, type, bedrooms, maxPrice]);

  const clearAll = () => {
    setQuery("");setCity("");setType("");setBedrooms("");setMaxPrice(5000);
  };

  const activeFilters = [city, type, bedrooms, maxPrice < 5000 ? "preço" : ""].filter(Boolean).length;

  return (
    <main>
      {/* Hero */}
      <section className="container" style={{ padding: "56px 32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <span className="mono" style={{ color: "var(--accent)" }}>● Aluguel direto, sem intermediário</span>
            <h1 style={{ fontSize: "clamp(40px, 4.6vw, 64px)", lineHeight: 1.02, marginTop: 16, letterSpacing: "-0.03em", textWrap: "balance" }}>
              Encontre uma casa que <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--accent)" }}>cabe</em> em você.
            </h1>
            <p style={{ marginTop: 20, fontSize: 17, color: "var(--ink-2)", maxWidth: 480, lineHeight: 1.5 }}>
              Imóveis anunciados por seus donos em Alegre e região do Caparaó. Sem taxas escondidas, sem fiador, sem corretor.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <button
                className="btn lg"
                onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                Ver imóveis disponíveis <Icon name="arrow" size={14} />
              </button>
              <button
                className="btn ghost lg"
                onClick={() => navigate("landlord-signup")}
              >
                Quero anunciar um imóvel
              </button>
            </div>

            {/* Popular searches */}
            <div style={{ marginTop: "auto", paddingTop: 32 }}>
              <span className="mono muted" style={{ display: "block", marginBottom: 10 }}>● Buscas populares</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "Próximo à UFES", set: () => { setType(""); setCity("Alegre, ES"); setBedrooms(""); } },
                  { label: "Kitnets em Alegre", set: () => { setType("Kitnet"); setCity("Alegre, ES"); setBedrooms(""); } },
                  { label: "Casas com quintal", set: () => { setType("Casa"); setCity(""); setBedrooms(""); } },
                  { label: "Até R$ 1.500", set: () => { setMaxPrice(1500); setType(""); setCity(""); setBedrooms(""); } },
                  { label: "3 quartos", set: () => { setBedrooms("3"); setType(""); setCity(""); } },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => { s.set(); setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    style={{
                      cursor: "pointer", border: "1px solid var(--line-2)",
                      background: "transparent", color: "var(--ink-2)",
                      fontSize: 13, fontWeight: 500,
                      borderRadius: 999, padding: "7px 14px",
                      whiteSpace: "nowrap", lineHeight: 1.4,
                      transition: "background 120ms, border-color 120ms, color 120ms",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.color = "var(--ink-2)"; }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Photo label="Apartamento — Centro, Alegre" aspect="5 / 4" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Photo label="Casa — Guaçuí" aspect="1 / 1" />
              <Photo label="Kitnet — Vila do Sul, Alegre" aspect="1 / 1" />
            </div>
          </div>
        </div>

        {/* Region strip: stats + cities served */}
        <div style={{
          marginTop: 40, padding: "24px 28px",
          border: "1px solid var(--line)", borderRadius: "var(--radius-lg)",
          background: "var(--bg)",
          display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, alignItems: "start",
        }}>
          <div style={{ display: "flex", gap: 36, flexShrink: 0 }}>
            {[
              { v: visible.length, l: "imóveis ativos" },
              { v: "10", l: "cidades atendidas" },
              { v: "100%", l: "sem comissão" },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {s.v}
                </div>
                <div className="mono muted" style={{ marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 32, minWidth: 0 }}>
            <span className="mono muted" style={{ display: "block", marginBottom: 10 }}>● Atendemos Alegre e região do Caparaó</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CITIES.map((c) => {
                const name = c.split(",")[0];
                const active = city === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCity(active ? "" : c)}
                    style={{
                      cursor: "pointer", border: "none",
                      background: active ? "var(--ink)" : "var(--bg-2)",
                      color: active ? "var(--bg)" : "var(--ink-2)",
                      fontSize: 12, fontWeight: 500,
                      borderRadius: 999, padding: "5px 11px",
                      whiteSpace: "nowrap", lineHeight: 1.4,
                      transition: "background 120ms, color 120ms",
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            <span className="mono" style={{ color: "var(--accent)" }}>Caparaó · ES</span>
            <span className="muted" style={{ fontSize: 11 }}>raio de ~60 km de Alegre</span>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="container" style={{ marginTop: 32 }}>
        <div className="card" style={{ padding: 8, display: "flex", alignItems: "center", gap: 8, borderColor: "var(--ink)" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Icon name="search" size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
            <input
              className="input"
              placeholder="Busque por bairro, cidade ou nome do imóvel…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", paddingLeft: 38, background: "transparent", height: 48, boxShadow: "none" }}
              onFocus={(e) => e.target.style.boxShadow = "none"} />
            
          </div>
          <div className="div" style={{ width: 1, height: 30 }}></div>
          <button className={"btn ghost"} onClick={() => setShowFilters(!showFilters)}
          style={{ borderColor: showFilters ? "var(--ink)" : "transparent" }}>
            <Icon name="filter" size={15} /> Filtros
            {activeFilters > 0 &&
            <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 999, fontSize: 11, padding: "1px 7px", marginLeft: 2 }}>
                {activeFilters}
              </span>
            }
          </button>
          <button className="btn">Buscar</button>
        </div>

        {showFilters &&
        <div className="card" style={{ marginTop: 12, padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.6fr auto", gap: 18, alignItems: "end" }}>
            <div className="field">
              <label>Cidade</label>
              <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Todas</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Qualquer</option>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Quartos</label>
              <select className="select" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">Qualquer</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className="field">
              <label>Preço máximo · {fmtBRL(maxPrice)}/mês</label>
              <input type="range" min="500" max="5000" step="50" value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
            style={{ accentColor: "var(--accent)", width: "100%" }} />
            </div>
            <button className="btn ghost sm" onClick={clearAll}>Limpar</button>
          </div>
        }
      </section>

      {/* Results */}
      <section className="container" id="results" style={{ marginTop: 48, scrollMarginTop: 80 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22 }}>{visible.length} {visible.length === 1 ? "imóvel disponível" : "imóveis disponíveis"}</h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              Atualizado em tempo real · Anunciados pelos próprios donos
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono muted">Ordenar</span>
            <select className="select" style={{ width: 180, height: 36 }} defaultValue="recent">
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="area">Maior área</option>
            </select>
          </div>
        </header>

        {visible.length === 0 ?
        <div className="empty">
            <p style={{ margin: 0 }}>Nenhum imóvel encontrado com esses filtros.</p>
            <button className="btn ghost sm" style={{ marginTop: 16 }} onClick={clearAll}>Limpar filtros</button>
          </div> :

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36, rowGap: 48 }}>
            {visible.map((l) =>
          <ListingCard
            key={l.id}
            listing={l}
            onOpen={openProperty}
            onFavorite={toggleFavorite}
            favorited={favorites.has(l.id)} />

          )}
          </div>
        }
      </section>

      {/* Call to action — locador */}
      <section className="container" style={{ marginTop: 96 }}>
        <div style={{
          background: "var(--ink)", color: "var(--bg)",
          borderRadius: "var(--radius-lg)", padding: "56px 56px",
          display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 48, alignItems: "center"
        }}>
          <div>
            <span className="mono" style={{ color: "var(--sun)" }}>● Para locadores</span>
            <h2 style={{ fontSize: 36, lineHeight: 1.05, marginTop: 12, letterSpacing: "-0.02em" }}>
              Anuncie seu imóvel<br />e fale direto com o locatário.
            </h2>
            <p style={{ marginTop: 16, color: "rgba(253,252,249,0.7)", fontSize: 15, maxWidth: 440 }}>
              Cadastro em 3 minutos. Você decide quando ativar ou pausar o anúncio.
            </p>
            <button className="btn sun" style={{ marginTop: 24 }} onClick={() => navigate("landlord-signup")}>
              Anunciar meu imóvel <Icon name="arrow" size={14} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
            { n: "01", t: "Cadastro rápido", d: "Crie sua conta de locador em minutos." },
            { n: "02", t: "Adicione o imóvel", d: "Fotos, localização e descrição." },
            { n: "03", t: "Receba contatos", d: "Locatários falam com você direto pelo WhatsApp." }].
            map((s) =>
            <div key={s.n} style={{ display: "flex", gap: 16, padding: "14px 0", borderTop: "1px solid rgba(253,252,249,0.12)" }}>
                <span className="mono" style={{ color: "var(--sun)", minWidth: 24 }}>{s.n}</span>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.t}</div>
                  <div style={{ color: "rgba(253,252,249,0.6)", fontSize: 13, marginTop: 2 }}>{s.d}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>);

};

window.Home = Home;
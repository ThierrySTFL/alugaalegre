import React from "react";
// Public home — hero, filters, grid (dados vindos de GET /imoveis)

// Formata o telefone (inteiro vindo da API) para exibição.
const formatTel = (tel) => {
  const d = String(tel ?? "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(tel ?? "");
};

// Adapta um AnuncioOut da API para a forma de "listing" que o app já consome.
const adaptAnuncio = (a) => ({
  id: a.idanuncio,
  title: a.titulo || "Imóvel sem título",
  type: a.tipo,
  city: `${a.endereco.cidade}, ${a.endereco.uf}`,
  neighborhood: a.endereco.bairro,
  price: a.preco,
  bedrooms: a.quartos,
  bathrooms: a.banheiros,
  area: a.area,
  amenities: a.comodidades || [],
  photoTags: (a.fotos || []).map((f) => f.descricao || "Foto"),
  photos: a.fotos || [],
  // URL da capa: a foto marcada como capa ("S") ou, na falta, a primeira.
  coverUrl: ((a.fotos || []).find((f) => f.capa === "S") || (a.fotos || [])[0])?.url || null,
  landlord: {
    id: a.locador.idlocador,
    name: a.locador.nome,
    phone: formatTel(a.locador.telefone),
    since: String(a.locador.desde || "").slice(0, 4),
    listings: null,
    rating: a.locador.mediaavaliacao,
  },
  description: a.descricao,
  desc: a.descricao,
  status: a.status === "A" ? "active" : "inactive",
  _raw: a,
});
window.adaptAnuncio = adaptAnuncio;

const Home = ({ navigate, openProperty, favorites, pendingFavorites, toggleFavorite, session, onAuth }) => {
  // Já logado como locador → direto pro painel; senão, abre o AuthModal.
  const irParaLocador = () => (session?.role === "landlord" ? navigate("dashboard") : onAuth("landlord"));

  // Opções dos filtros vindas da API: cidades com anúncio ativo e tipos.
  const [cities, setCities] = React.useState([]);
  const [types, setTypes] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [city, setCity] = React.useState("");
  const [type, setType] = React.useState("");
  const [bedrooms, setBedrooms] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState(5000);
  const [showFilters, setShowFilters] = React.useState(false);

  // Destaques do hero: os 3 anúncios mais recentes. Slots sem anúncio ficam
  // como placeholder e passam a exibir o imóvel assim que ele for publicado.
  const [heroListings, setHeroListings] = React.useState([]);

  const [listings, setListings] = React.useState([]);
  const [totalListings, setTotalListings] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [sortBy, setSortBy] = React.useState("recent");
  const PAGE_SIZE = 20;
  // Ignora respostas obsoletas (filtro trocado antes de a anterior chegar).
  const reqId = React.useRef(0);

  const montarFiltros = React.useCallback((offset = 0) => ({
    busca: query.trim() || undefined,
    cidade: city ? city.split(",")[0].trim() : undefined,
    tipo: type || undefined,
    quartos: bedrooms ? parseInt(bedrooms, 10) : undefined,
    preco_max: maxPrice < 5000 ? maxPrice : undefined,
    limit: PAGE_SIZE,
    offset,
    ordem: sortBy,
  }), [query, city, type, bedrooms, maxPrice, sortBy]);

  const buscar = React.useCallback(async () => {
    const meuId = ++reqId.current;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    try {
      const { imoveis, total } = await window.api.listarImoveisPaginado(montarFiltros(0));
      if (meuId !== reqId.current) return; // chegou uma busca mais nova
      setListings(imoveis.map(adaptAnuncio));
      setTotalListings(total);
    } catch (err) {
      if (meuId !== reqId.current) return;
      setError(err.message || "Não foi possível carregar os imóveis.");
      setListings([]);
      setTotalListings(0);
    } finally {
      if (meuId === reqId.current) setLoading(false);
    }
  }, [montarFiltros]);

  const carregarMais = React.useCallback(async () => {
    if (loadingMore || listings.length >= totalListings) return;
    const meuId = reqId.current;
    setLoadingMore(true);
    setError(null);
    try {
      const { imoveis, total } = await window.api.listarImoveisPaginado(montarFiltros(listings.length));
      if (meuId !== reqId.current) return;
      setListings((atuais) => [...atuais, ...imoveis.map(adaptAnuncio)]);
      setTotalListings(total);
    } catch (err) {
      if (meuId !== reqId.current) return;
      setError(err.message || "Não foi possível carregar mais imóveis.");
    } finally {
      if (meuId === reqId.current) setLoadingMore(false);
    }
  }, [montarFiltros, loadingMore, listings.length, totalListings]);

  // Busca com debounce sempre que um filtro ou a ordenação muda. A API ordena
  // antes de paginar, então trocar ordenação reseta para a primeira página.
  React.useEffect(() => {
    const id = setTimeout(buscar, 350);
    return () => clearTimeout(id);
  }, [buscar]);

  // Carrega uma vez os destaques do hero. Se falhar, os 3 slots ficam
  // como placeholder decorativo, igual antes.
  React.useEffect(() => {
    window.api.listarImoveis({ limit: 3 })
      .then((anuncios) => setHeroListings(anuncios.map(adaptAnuncio)))
      .catch(() => {});
  }, []);

  // Carrega uma vez as opções dos selects. Se falhar, os filtros ficam vazios
  // mas a busca (texto/preço/quartos) continua funcionando.
  React.useEffect(() => {
    Promise.all([window.api.getCidades(), window.api.getTipos()])
      .then(([cidades, tipos]) => {
        setCities(cidades.map((c) => `${c.nome}, ${c.uf}`));
        setTypes(tipos.map((t) => t.nome));
      })
      .catch(() => {});
  }, []);

  const clearAll = () => {
    setQuery(""); setCity(""); setType(""); setBedrooms(""); setMaxPrice(5000);
  };

  const irParaResultados = () =>
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Um slot do hero: mostra o anúncio real (clicável) quando existe; senão,
  // fica o placeholder listrado esperando o próximo imóvel publicado.
  const heroSlot = (i, aspect) => {
    const l = heroListings[i];
    return l ? (
      <Photo key={l.id} src={l.coverUrl} alt={l.title} aspect={aspect} onClick={() => openProperty(l)}>
        <span className="lbl">{l.type} — {l.neighborhood}, {l.city}</span>
      </Photo>
    ) : (
      <Photo key={`vago-${i}`} label="Seu imóvel aqui" aspect={aspect} />
    );
  };

  const activeFilters = [city, type, bedrooms, maxPrice < 5000 ? "preço" : ""].filter(Boolean).length;

  return (
    <main>
      {/* Hero */}
      <section className="container" style={{ padding: "56px 32px 24px" }}>
        <div className="grid-hero">
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <span className="mono" style={{ color: "var(--accent)" }}>● Aluguel direto, sem intermediário</span>
            <h1 style={{ fontSize: "clamp(40px, 4.6vw, 64px)", lineHeight: 1.02, marginTop: 16, letterSpacing: "-0.03em", textWrap: "balance" }}>
              Encontre uma casa que <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--accent)" }}>cabe</em> em você.
            </h1>
            <p style={{ marginTop: 20, fontSize: 17, color: "var(--ink-2)", maxWidth: 480, lineHeight: 1.5 }}>
              Imóveis anunciados por seus donos em Alegre, ES.
              <br />
              Sem taxas escondidas, sem intermediação, sem corretor.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <button className="btn lg" onClick={irParaResultados}>
                Ver imóveis disponíveis <Icon name="arrow" size={14} />
              </button>
              <button
                className="btn ghost lg"
                onClick={irParaLocador}
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
                    onClick={() => { s.set(); setTimeout(irParaResultados, 50); }}
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
            {heroSlot(0, "5 / 4")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {heroSlot(1, "1 / 1")}
              {heroSlot(2, "1 / 1")}
            </div>
          </div>
        </div>

      </section>

      {/* Search bar */}
      <section className="container" style={{ marginTop: 32 }}>
        <div className="card searchbar" style={{ padding: 8, borderColor: "var(--ink)" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Icon name="search" size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
            <input
              className="input"
              placeholder="Busque por nome, descrição ou característica do imóvel…"
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
          <button className="btn" onClick={() => { buscar(); irParaResultados(); }}>Buscar</button>
        </div>

        {showFilters &&
        <div className="card grid-filters" style={{ marginTop: 12, padding: 24 }}>
            <div className="field">
              <label>Cidade</label>
              <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Todas</option>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Qualquer</option>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Quartos (mín.)</label>
              <select className="select" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">Qualquer</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
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
            <h2 style={{ fontSize: 22 }}>
              {loading
                ? "Buscando imóveis…"
                : error
                  ? "Não foi possível carregar"
                  : `${totalListings} ${totalListings === 1 ? "imóvel disponível" : "imóveis disponíveis"}`}
            </h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {listings.length > 0
                ? `Mostrando ${listings.length} de ${totalListings} · Anunciados pelos próprios donos`
                : "Atualizado em tempo real · Anunciados pelos próprios donos"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono muted">Ordenar</span>
            <select className="select" style={{ width: 180, height: 36 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="area">Maior área</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span className="spinner" style={{ width: 24, height: 24, color: "var(--accent)" }} />
            <p style={{ margin: 0 }}>Carregando imóveis…</p>
          </div>
        ) : error ? (
          <div className="empty">
            <p style={{ margin: 0 }}>{error}</p>
            <button className="btn ghost sm" style={{ marginTop: 16 }} onClick={buscar}>Tentar de novo</button>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty">
            <p style={{ margin: 0 }}>Nenhum imóvel encontrado com esses filtros.</p>
            <button className="btn ghost sm" style={{ marginTop: 16 }} onClick={clearAll}>Limpar filtros</button>
          </div>
        ) : (
          <>
            <div className="grid-results">
              {listings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  onOpen={openProperty}
                  onFavorite={toggleFavorite}
                  favorited={favorites.has(l.id)}
                  favoritePending={pendingFavorites.has(l.id)} />
              ))}
            </div>
            {listings.length < totalListings && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                <button className="btn ghost" onClick={carregarMais} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16, color: "var(--accent)" }} />
                      Carregando…
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Call to action — locador */}
      <section className="container" style={{ marginTop: 96 }}>
        <div className="grid-cta" style={{
          background: "var(--ink)", color: "var(--bg)",
          borderRadius: "var(--radius-lg)",
        }}>
          <div>
            <span className="mono" style={{ color: "var(--sun)" }}>● Para locadores</span>
            <h2 style={{ fontSize: 36, lineHeight: 1.05, marginTop: 12, letterSpacing: "-0.02em" }}>
              Anuncie seu imóvel<br />e fale direto com o locatário.
            </h2>
            <p style={{ marginTop: 16, color: "rgba(253,252,249,0.7)", fontSize: 15, maxWidth: 440 }}>
              Cadastro em minutos, você decide quando ativar ou pausar o anúncio.
            </p>
            <button className="btn sun" style={{ marginTop: 24 }} onClick={irParaLocador}>
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

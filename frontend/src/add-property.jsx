import React from "react";
// Add property — multi-step

const STEP_DEFS = [
  { id: 1, label: "Tipo & local" },
  { id: 2, label: "Detalhes" },
  { id: 3, label: "Fotos" },
  { id: 4, label: "Revisão" },
];

const formatCEP = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

const AddProperty = ({ navigate, onCreate }) => {
  const { CITIES } = window.DATA; // cidades ainda do mock (região de Alegre)
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState({
    idtipo: null,
    city: "",
    neighborhood: "",
    rua: "",
    numero: "",
    cep: "",
    title: "",
    description: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    area: "",
    comodidadeIds: [],
    photos: [],
  });
  const [errors, setErrors] = React.useState({});
  const [publishing, setPublishing] = React.useState(false);

  // Referências (tipos / comodidades) carregadas da API.
  const [tipos, setTipos] = React.useState([]);
  const [comodidades, setComodidades] = React.useState([]);
  const [refLoading, setRefLoading] = React.useState(true);
  const [refError, setRefError] = React.useState(null);

  const carregarRefs = React.useCallback(async () => {
    setRefLoading(true);
    setRefError(null);
    try {
      const [ts, cs] = await Promise.all([
        window.api.getTipos(),
        window.api.getComodidades(),
      ]);
      setTipos(ts);
      setComodidades(cs);
    } catch (err) {
      setRefError(err.message || "Não foi possível carregar as opções do formulário.");
    } finally {
      setRefLoading(false);
    }
  }, []);
  React.useEffect(() => { carregarRefs(); }, [carregarRefs]);

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const toggleComodidade = (id) =>
    update("comodidadeIds", data.comodidadeIds.includes(id)
      ? data.comodidadeIds.filter((x) => x !== id)
      : [...data.comodidadeIds, id]);

  const tipoNome = (id) => tipos.find((t) => t.idtipo === id)?.nome || "";
  const comodidadeNome = (id) => comodidades.find((c) => c.idcomodidade === id)?.nome || "";

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!data.idtipo) e.type = "Escolha o tipo do imóvel.";
      if (!data.city) e.city = "Escolha uma cidade.";
      if (!data.neighborhood.trim()) e.neighborhood = "Informe o bairro.";
      if (!data.rua.trim()) e.rua = "Informe a rua.";
      if (!String(data.numero).trim()) e.numero = "Nº obrigatório.";
      if (data.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP inválido.";
    }
    if (step === 2) {
      if (!data.title.trim() || data.title.length < 10) e.title = "Título com pelo menos 10 caracteres.";
      if (!data.description.trim() || data.description.length < 30) e.description = "Descrição com pelo menos 30 caracteres.";
      if (!data.price || parseInt(data.price, 10) < 100) e.price = "Informe um preço válido.";
      if (!data.area || parseInt(data.area, 10) < 10) e.area = "Informe a área em m².";
    }
    if (step === 3 && data.photos.length < 3) {
      e.photos = "Adicione pelo menos 3 fotos.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const addPhoto = () => {
    const tags = ["Sala", "Cozinha", "Quarto principal", "Quarto 2", "Banheiro", "Varanda", "Fachada", "Vista", "Área comum"];
    const tag = tags[data.photos.length % tags.length];
    update("photos", [...data.photos, { id: `p-${Date.now()}-${data.photos.length}`, label: tag }]);
  };
  const removePhoto = (id) => update("photos", data.photos.filter((p) => p.id !== id));

  const publish = () => {
    setPublishing(true);
    setTimeout(() => {
      onCreate({
        id: `p-new-${Date.now()}`,
        title: data.title,
        type: tipoNome(data.idtipo),
        city: data.city,
        neighborhood: data.neighborhood,
        price: parseInt(data.price, 10),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: parseInt(data.area, 10),
        amenities: data.comodidadeIds.map(comodidadeNome).filter(Boolean),
        photoTags: data.photos.map((p) => p.label),
        description: data.description,
        desc: data.description.slice(0, 60),
        status: "active",
        landlord: { name: window.DATA.DEMO_LANDLORD, phone: "+55 11 98765-4321", since: "2023", listings: 5 },
      });
      navigate("dashboard");
    }, 900);
  };

  const renderStep = () => {
    if (refLoading) {
      return (
        <div className="empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span className="spinner" style={{ width: 24, height: 24, color: "var(--accent)" }} />
          <p style={{ margin: 0 }}>Carregando opções do formulário…</p>
        </div>
      );
    }
    if (refError) {
      return (
        <div className="empty">
          <p style={{ margin: 0 }}>{refError}</p>
          <button className="btn ghost sm" style={{ marginTop: 16 }} onClick={carregarRefs}>Tentar de novo</button>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div>
          <h2 style={{ fontSize: 22 }}>Onde fica e o que é?</h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            Comece pelo básico — vamos refinar depois.
          </p>

          <div style={{ marginTop: 28 }}>
            <label style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>
              Tipo do imóvel<span className="req">*</span>
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {tipos.map((t) => (
                <button
                  key={t.idtipo}
                  onClick={() => update("idtipo", t.idtipo)}
                  className="btn ghost"
                  style={{
                    borderColor: data.idtipo === t.idtipo ? "var(--ink)" : "var(--line-2)",
                    background: data.idtipo === t.idtipo ? "var(--bg-2)" : "transparent",
                  }}
                >
                  {t.nome}
                </button>
              ))}
            </div>
            {errors.type && <span className="err">{errors.type}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
            <div className="field">
              <label>Cidade<span className="req">*</span></label>
              <select className={"select" + (errors.city ? " invalid" : "")} value={data.city} onChange={(e) => update("city", e.target.value)}>
                <option value="">Selecione…</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.city && <span className="err">{errors.city}</span>}
            </div>
            <div className="field">
              <label>Bairro<span className="req">*</span></label>
              <input className={"input" + (errors.neighborhood ? " invalid" : "")} value={data.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} placeholder="Ex: Centro" />
              {errors.neighborhood && <span className="err">{errors.neighborhood}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 16 }}>
            <div className="field">
              <label>Rua<span className="req">*</span></label>
              <input className={"input" + (errors.rua ? " invalid" : "")} value={data.rua} onChange={(e) => update("rua", e.target.value)} placeholder="Ex: Rua XV de Novembro" />
              {errors.rua && <span className="err">{errors.rua}</span>}
            </div>
            <div className="field">
              <label>Número<span className="req">*</span></label>
              <input className={"input" + (errors.numero ? " invalid" : "")} type="number" value={data.numero} onChange={(e) => update("numero", e.target.value)} placeholder="120" />
              {errors.numero && <span className="err">{errors.numero}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div className="field">
              <label>CEP<span className="req">*</span></label>
              <input className={"input" + (errors.cep ? " invalid" : "")} value={data.cep} onChange={(e) => update("cep", formatCEP(e.target.value))} placeholder="29500-000" inputMode="numeric" />
              {errors.cep && <span className="err">{errors.cep}</span>}
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div>
          <h2 style={{ fontSize: 22 }}>Detalhes do anúncio</h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            Conte o que torna o imóvel especial.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 28 }}>
            <div className="field">
              <label>Título<span className="req">*</span></label>
              <input className={"input" + (errors.title ? " invalid" : "")} value={data.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex: Apartamento amplo no Centro de Alegre" maxLength={80} />
              {errors.title ? <span className="err">{errors.title}</span> : <span className="muted" style={{ fontSize: 11 }}>{data.title.length}/80</span>}
            </div>
            <div className="field">
              <label>Descrição<span className="req">*</span></label>
              <textarea className={"textarea" + (errors.description ? " invalid" : "")} value={data.description} onChange={(e) => update("description", e.target.value)} placeholder="O que torna o imóvel especial? Vizinhança, reforma, mobília…" rows={4} />
              {errors.description ? <span className="err">{errors.description}</span> : <span className="muted" style={{ fontSize: 11 }}>{data.description.length} caracteres</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div className="field">
                <label>Aluguel mensal (R$)<span className="req">*</span></label>
                <input className={"input" + (errors.price ? " invalid" : "")} type="number" value={data.price} onChange={(e) => update("price", e.target.value)} placeholder="1400" />
                {errors.price && <span className="err">{errors.price}</span>}
              </div>
              <div className="field">
                <label>Área (m²)<span className="req">*</span></label>
                <input className={"input" + (errors.area ? " invalid" : "")} type="number" value={data.area} onChange={(e) => update("area", e.target.value)} placeholder="64" />
                {errors.area && <span className="err">{errors.area}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Stepper label="Quartos" value={data.bedrooms} onChange={(v) => update("bedrooms", v)} min={0} max={10} />
              <Stepper label="Banheiros" value={data.bathrooms} onChange={(v) => update("bathrooms", v)} min={1} max={10} />
            </div>

            <div className="field">
              <label>Comodidades</label>
              <div className="checkgrid">
                {comodidades.map((c) => {
                  const on = data.comodidadeIds.includes(c.idcomodidade);
                  return (
                    <label key={c.idcomodidade} className={on ? "checked" : ""}>
                      <input type="checkbox" checked={on} onChange={() => toggleComodidade(c.idcomodidade)} />
                      {c.nome}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div>
          <h2 style={{ fontSize: 22 }}>Fotos do imóvel</h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            A primeira foto é a capa. Mínimo 3, recomendado 6 ou mais.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24 }}>
            {data.photos.map((p, i) => (
              <div key={p.id} style={{ position: "relative" }}>
                <Photo label={p.label} aspect="4 / 3" />
                {i === 0 && (
                  <span className="pill sun" style={{ position: "absolute", top: 8, left: 8 }}>
                    <Icon name="star" size={11} /> Capa
                  </span>
                )}
                <button
                  onClick={() => removePhoto(p.id)}
                  className="btn icon sm"
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(253,252,249,0.9)", border: "none", color: "var(--ink)", width: 28, height: 28 }}
                >
                  <Icon name="close" size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={addPhoto}
              style={{
                aspectRatio: "4 / 3", border: "1.5px dashed var(--line-2)", background: "transparent",
                borderRadius: "var(--radius)", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ink-3)",
                cursor: "pointer", transition: "border-color 120ms, color 120ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.color = "var(--ink-3)"; }}
            >
              <Icon name="upload" size={20} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Adicionar foto</span>
              <span className="mono">JPG / PNG · até 5 MB</span>
            </button>
          </div>

          {errors.photos && <span className="err" style={{ marginTop: 12, display: "block" }}>{errors.photos}</span>}
          <p className="muted" style={{ fontSize: 12, marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="sparkle" size={14} /> Dica: fotos claras e horizontais aumentam o interesse em até 3×.
          </p>
        </div>
      );
    }

    // step === 4
    return (
      <div>
        <h2 style={{ fontSize: 22 }}>Revise antes de publicar</h2>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          Tudo certo? Você pode editar depois pelo painel.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32, marginTop: 28 }}>
          <div>
            <Photo label={data.photos[0]?.label || "Capa"} aspect="4 / 3" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
              {data.photos.slice(1, 4).map((p) => (
                <Photo key={p.id} label="" aspect="1 / 1" style={{ padding: 0 }} />
              ))}
            </div>
          </div>
          <div>
            <span className="pill sun">{tipoNome(data.idtipo)}</span>
            <h3 style={{ fontSize: 22, marginTop: 10, lineHeight: 1.15 }}>{data.title}</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              <Icon name="pin" size={12} /> {data.rua}, {data.numero} · {data.neighborhood}, {data.city}
            </p>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginTop: 14 }}>
              {fmtBRL(parseInt(data.price || 0, 10))}<span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-3)" }}>/mês</span>
            </div>
            <div style={{ display: "flex", gap: 16, color: "var(--ink-3)", fontSize: 13, marginTop: 14 }}>
              <span><Icon name="bed" size={13} /> {data.bedrooms} quartos</span>
              <span><Icon name="bath" size={13} /> {data.bathrooms} banh.</span>
              <span><Icon name="area" size={13} /> {data.area}m²</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 16, lineHeight: 1.55 }}>
              {data.description}
            </p>
            {data.comodidadeIds.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
                {data.comodidadeIds.map((id) => <span key={id} className="pill">{comodidadeNome(id)}</span>)}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 32, padding: 20, background: "var(--bg-2)", borderRadius: "var(--radius)", fontSize: 13, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <Icon name="sparkle" size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong style={{ fontFamily: "var(--font-display)" }}>Tudo pronto.</strong> Ao publicar, seu imóvel ficará disponível na busca pública.
            Você pode pausar a qualquer momento pelo painel.
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="container" style={{ padding: "32px 32px 80px", maxWidth: 880 }}>
      <a className="link" style={{ fontSize: 13, color: "var(--ink-3)" }} onClick={() => navigate("dashboard")}>
        ← Voltar para o painel
      </a>

      <header style={{ marginTop: 20, marginBottom: 32 }}>
        <span className="mono" style={{ color: "var(--accent)" }}>● Novo imóvel</span>
        <h1 style={{ fontSize: 36, marginTop: 10, letterSpacing: "-0.02em" }}>
          Cadastre um imóvel para alugar.
        </h1>

        {/* Step indicator */}
        <div className="steps" style={{ marginTop: 28 }}>
          {STEP_DEFS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={"step " + (step === s.id ? "active" : step > s.id ? "done" : "")}>
                <span className="num">{step > s.id ? "✓" : s.id}</span>
                <span>{s.label}</span>
              </div>
              {i < STEP_DEFS.length - 1 && <span className="sep"></span>}
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="card" style={{ padding: 36 }}>
        {renderStep()}

        {/* Footer nav */}
        <div className="div" style={{ margin: "32px 0 20px" }}></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn ghost" onClick={step === 1 ? () => navigate("dashboard") : back}>
            <Icon name="arrow-left" size={14} /> {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          <span className="mono muted">Passo {step} de {STEP_DEFS.length}</span>
          {step < 4 ? (
            <button className="btn" onClick={next} disabled={refLoading || !!refError}>
              Continuar <Icon name="arrow" size={14} />
            </button>
          ) : (
            <button className="btn accent" onClick={publish} disabled={publishing}>
              {publishing ? <><span className="spinner" /> Publicando…</> : <>Publicar imóvel <Icon name="check" size={14} stroke={2} /></>}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

const Stepper = ({ label, value, onChange, min = 0, max = 10 }) => (
  <div className="field">
    <label>{label}</label>
    <div style={{ display: "flex", alignItems: "center", height: 44, border: "1px solid var(--line-2)", borderRadius: "var(--radius)" }}>
      <button onClick={() => onChange(Math.max(min, value - 1))}
              style={{ width: 44, height: "100%", background: "transparent", border: "none", borderRight: "1px solid var(--line-2)", cursor: "pointer", color: "var(--ink-2)" }}>−</button>
      <span style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 500 }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
              style={{ width: 44, height: "100%", background: "transparent", border: "none", borderLeft: "1px solid var(--line-2)", cursor: "pointer", color: "var(--ink-2)" }}>+</button>
    </div>
  </div>
);

window.AddProperty = AddProperty;

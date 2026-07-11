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

// Locais atendidos. Hoje só Alegre/ES; para expandir, adicione a UF em UFS
// e as cidades correspondentes em CIDADES_POR_UF.
const UFS = ["ES"];
const CIDADES_POR_UF = { ES: ["Alegre"] };

const AddProperty = ({ navigate }) => {
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState({
    idtipo: null,
    uf: UFS.length === 1 ? UFS[0] : "",
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
  const [pubError, setPubError] = React.useState(null);

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
      if (!data.uf) e.uf = "Escolha a UF.";
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
    if (step === 3) {
      if (data.photos.some((p) => p.uploading)) {
        e.photos = "Aguarde o upload das fotos terminar.";
      } else if (data.photos.filter((p) => p.url && !p.error).length < 3) {
        e.photos = "Adicione pelo menos 3 fotos.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePublish = () => {
    const e = {};
    let firstInvalidStep = null;
    const mark = (stepId) => {
      if (firstInvalidStep == null) firstInvalidStep = stepId;
    };

    if (!data.idtipo) { e.type = "Escolha o tipo do imóvel."; mark(1); }
    if (!data.uf) { e.uf = "Escolha a UF."; mark(1); }
    if (!data.city) { e.city = "Escolha uma cidade."; mark(1); }
    if (!data.neighborhood.trim()) { e.neighborhood = "Informe o bairro."; mark(1); }
    if (!data.rua.trim()) { e.rua = "Informe a rua."; mark(1); }
    if (!String(data.numero).trim()) { e.numero = "Nº obrigatório."; mark(1); }
    if (data.cep.replace(/\D/g, "").length !== 8) { e.cep = "CEP inválido."; mark(1); }

    if (!data.title.trim() || data.title.length < 10) { e.title = "Título com pelo menos 10 caracteres."; mark(2); }
    if (!data.description.trim() || data.description.length < 30) { e.description = "Descrição com pelo menos 30 caracteres."; mark(2); }
    if (!data.price || parseInt(data.price, 10) < 100) { e.price = "Informe um preço válido."; mark(2); }
    if (!data.area || parseInt(data.area, 10) < 10) { e.area = "Informe a área em m²."; mark(2); }

    if (data.photos.some((p) => p.uploading)) {
      e.photos = "Aguarde o upload das fotos terminar.";
      mark(3);
    } else if (data.photos.filter((p) => p.url && !p.error).length < 3) {
      e.photos = "Adicione pelo menos 3 fotos.";
      mark(3);
    }

    setErrors(e);
    if (firstInvalidStep != null) {
      setStep(firstInvalidStep);
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const fileInputRef = React.useRef(null);
  const MAX_MB = 5;

  // Sobe cada arquivo pro Supabase Storage; mostra preview local na hora e
  // troca por estado de sucesso/erro conforme o upload resolve.
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // permite re-selecionar o mesmo arquivo
    let rejeitadas = 0;
    for (const file of files) {
      if (!file.type.startsWith("image/") || file.size > MAX_MB * 1024 * 1024) {
        rejeitadas++;
        continue;
      }
      const id = `ph-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);
      setData((d) => ({
        ...d,
        photos: [...d.photos, { id, url: null, preview, uploading: true, error: false }],
      }));
      window
        .uploadFoto(file)
        .then((url) =>
          setData((d) => ({
            ...d,
            photos: d.photos.map((p) => (p.id === id ? { ...p, url, uploading: false } : p)),
          }))
        )
        .catch(() =>
          setData((d) => ({
            ...d,
            photos: d.photos.map((p) => (p.id === id ? { ...p, uploading: false, error: true } : p)),
          }))
        );
    }
    setErrors((prev) => ({
      ...prev,
      photos: rejeitadas > 0 ? `${rejeitadas} arquivo(s) ignorado(s): use imagens de até ${MAX_MB} MB.` : undefined,
    }));
  };

  const removePhoto = (id) =>
    setData((d) => {
      const alvo = d.photos.find((p) => p.id === id);
      if (alvo?.preview) URL.revokeObjectURL(alvo.preview);
      return { ...d, photos: d.photos.filter((p) => p.id !== id) };
    });

  const publish = async () => {
    if (publishing || !validatePublish()) return;
    setPublishing(true);
    setPubError(null);
    try {
      const fotos = data.photos
        .filter((p) => p.url && !p.error)
        .map((p, i) => ({ url: p.url, capa: i === 0 }));

      await window.api.criarImovel({
        idtipo: data.idtipo,
        titulo: data.title,
        preco: parseFloat(data.price),
        descricao: data.description,
        quartos: data.bedrooms,
        banheiros: data.bathrooms,
        area: parseFloat(data.area),
        comodidade_ids: data.comodidadeIds,
        endereco: {
          rua: data.rua,
          numero: parseInt(data.numero, 10),
          bairro: data.neighborhood,
          cep: data.cep,
          cidade: data.city,
          uf: data.uf,
        },
        fotos,
      });

      navigate("dashboard");
    } catch (err) {
      setPubError(err.message || "Não foi possível publicar o imóvel.");
    } finally {
      setPublishing(false);
    }
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

          <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.3fr 1fr", gap: 16, marginTop: 28 }}>
            <div className="field">
              <label>UF<span className="req">*</span></label>
              <select className={"select" + (errors.uf ? " invalid" : "")} value={data.uf} onChange={(e) => setData((d) => ({ ...d, uf: e.target.value, city: "" }))}>
                <option value="">—</option>
                {UFS.map((u) => <option key={u}>{u}</option>)}
              </select>
              {errors.uf && <span className="err">{errors.uf}</span>}
            </div>
            <div className="field">
              <label>Cidade<span className="req">*</span></label>
              <select className={"select" + (errors.city ? " invalid" : "")} value={data.city} onChange={(e) => update("city", e.target.value)} disabled={!data.uf}>
                <option value="">Selecione…</option>
                {(CIDADES_POR_UF[data.uf] || []).map((c) => <option key={c}>{c}</option>)}
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
                <input className={"input" + (errors.price ? " invalid" : "")} type="number" min="0" step="1" value={data.price} onChange={(e) => update("price", e.target.value)} placeholder="1400" />
                {errors.price && <span className="err">{errors.price}</span>}
              </div>
              <div className="field">
                <label>Área (m²)<span className="req">*</span></label>
                <input className={"input" + (errors.area ? " invalid" : "")} type="number" min="0" step="1" value={data.area} onChange={(e) => update("area", e.target.value)} placeholder="64" />
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
              <div key={p.id} style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--bg-2)" }}>
                <img
                  src={p.preview || p.url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: p.uploading || p.error ? 0.4 : 1 }}
                />
                {i === 0 && !p.error && (
                  <span className="pill sun" style={{ position: "absolute", top: 8, left: 8 }}>
                    <Icon name="star" size={11} /> Capa
                  </span>
                )}
                {p.uploading && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="spinner" style={{ color: "var(--accent)" }} />
                  </div>
                )}
                {p.error && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--danger)", fontSize: 11, textAlign: "center", padding: 8 }}>
                    <Icon name="close" size={16} /> Falha no upload
                  </div>
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
              onClick={() => fileInputRef.current?.click()}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              style={{ display: "none" }}
            />
          </div>

          {errors.photos && <span className="err" style={{ marginTop: 12, display: "block" }}>{errors.photos}</span>}
          <p className="muted" style={{ fontSize: 12, marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="sparkle" size={14} /> Dica: fotos claras e horizontais aumentam o interesse em até 3×.
          </p>
        </div>
      );
    }

    // step === 4
    const fotosValidas = data.photos.filter((p) => p.url && !p.error);
    return (
      <div>
        <h2 style={{ fontSize: 22 }}>Revise antes de publicar</h2>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          Tudo certo? Você pode editar depois pelo painel.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32, marginTop: 28 }}>
          <div>
            {fotosValidas[0] ? (
              <img src={fotosValidas[0].url} alt="" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: "var(--radius)", display: "block" }} />
            ) : (
              <Photo label="Capa" aspect="4 / 3" />
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
              {fotosValidas.slice(1, 4).map((p) => (
                <img key={p.id} src={p.url} alt="" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "var(--radius)", display: "block" }} />
              ))}
            </div>
          </div>
          <div>
            <span className="pill sun">{tipoNome(data.idtipo)}</span>
            <h3 style={{ fontSize: 22, marginTop: 10, lineHeight: 1.15 }}>{data.title}</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              <Icon name="pin" size={12} /> {data.rua}, {data.numero} · {data.neighborhood}, {data.city}{data.uf ? `, ${data.uf}` : ""}
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

        {pubError && <div className="err" style={{ marginTop: 16, fontSize: 13 }}>{pubError}</div>}
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
          <button className="btn ghost" onClick={step === 1 ? () => navigate("dashboard") : back} disabled={publishing}>
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

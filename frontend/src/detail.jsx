import React from "react";
// Property detail page with photo gallery

// Linha de estrelas somente-leitura (a interativa vive no RatingModal).
const Stars = ({ value, size = 13 }) => (
  <span style={{ display: "inline-flex", gap: 2, color: "var(--sun)" }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Icon key={n} name={n <= value ? "star-fill" : "star"} size={size} />
    ))}
  </span>
);

const formatDataAvaliacao = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR");

// Bloco "Avaliações do locador": lista pública + botão "Avaliar", que só
// aparece para quem é elegível (já pediu contato, não é o próprio locador e
// ainda não avaliou) — a API revalida tudo no POST de qualquer forma.
const LandlordReviews = ({ landlord, session, contactVersion }) => {
  const [avaliacoes, setAvaliacoes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState(null);
  const [elegivel, setElegivel] = React.useState(false);
  const [showRate, setShowRate] = React.useState(false);

  React.useEffect(() => {
    let ativo = true;
    setLoading(true);
    setErro(null);
    window.api.getAvaliacoes(landlord.id)
      .then((lista) => { if (ativo) setAvaliacoes(lista); })
      .catch(() => { if (ativo) setErro("Não foi possível carregar as avaliações."); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [landlord.id]);

  // Elegibilidade é melhor-esforço: se a chamada falhar, o botão só não aparece.
  // Reavalia também quando contactVersion muda — é o sinal de que um contato
  // acabou de ser liberado (o que pode ter acabado de tornar o usuário elegível).
  React.useEffect(() => {
    if (!session) { setElegivel(false); return; }
    let ativo = true;
    window.api.podeAvaliar(landlord.id)
      .then((r) => { if (ativo) setElegivel(r.elegivel); })
      .catch(() => {});
    return () => { ativo = false; };
  }, [landlord.id, session, contactVersion]);

  const media = avaliacoes.length
    ? avaliacoes.reduce((soma, a) => soma + a.estrelas, 0) / avaliacoes.length
    : null;

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ fontSize: 20 }}>Avaliações do locador</h2>
        {elegivel && (
          <button className="btn ghost sm" onClick={() => setShowRate(true)}>
            <Icon name="star" size={14} /> Avaliar
          </button>
        )}
      </div>

      {loading ? (
        <p className="muted" style={{ fontSize: 14, marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="spinner" style={{ width: 14, height: 14, color: "var(--accent)" }} />
          Carregando avaliações…
        </p>
      ) : erro ? (
        <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>{erro}</p>
      ) : avaliacoes.length === 0 ? (
        <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>
          {landlord.name.split(" ")[0]} ainda não recebeu avaliações.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600 }}>
              {media.toFixed(1).replace(".", ",")}
            </span>
            <Stars value={Math.round(media)} size={15} />
            <span className="muted" style={{ fontSize: 13 }}>
              {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
            </span>
          </div>
          <div style={{ marginTop: 8 }}>
            {avaliacoes.map((a) => (
              <div key={a.idavaliacao} style={{ padding: "16px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={a.cliente_nome} size={30} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{a.cliente_nome}</span>
                  </div>
                  <span className="muted" style={{ fontSize: 12 }}>{formatDataAvaliacao(a.dataavaliacao)}</span>
                </div>
                <div style={{ marginTop: 8 }}><Stars value={a.estrelas} /></div>
                {a.descricao && (
                  <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.55, textWrap: "pretty" }}>
                    {a.descricao}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {showRate && (
        <RatingModal
          landlord={landlord}
          onClose={() => setShowRate(false)}
          onCreated={(nova) => {
            setAvaliacoes((atuais) => [nova, ...atuais]);
            setElegivel(false);
          }}
        />
      )}
    </div>
  );
};

const Detail = ({ listing, navigate, onContact, onReport, onShare, favorited, favoritePending = false, toggleFavorite, session, contactVersion }) => {
  const [activePhoto, setActivePhoto] = React.useState(0);
  const [galleryOpen, setGalleryOpen] = React.useState(false);

  if (!listing) return null;

  return (
    <main>
      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: 28, fontSize: 13, color: "var(--ink-3)" }}>
        <a className="link" onClick={() => navigate("home")}>← Voltar para a busca</a>
      </div>

      {/* Header */}
      <header className="container" style={{ paddingTop: 24, paddingBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
        <div>
          <span className="pill sun">{listing.type}</span>
          <h1 style={{ fontSize: 38, lineHeight: 1.05, marginTop: 12, letterSpacing: "-0.02em", maxWidth: 720 }}>
            {listing.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, color: "var(--ink-2)", fontSize: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="pin" size={14} /> {listing.neighborhood}, {listing.city}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost sm" onClick={() => toggleFavorite(listing.id)} disabled={favoritePending}>
            {favoritePending ? (
              <span className="spinner" style={{ width: 14, height: 14, color: "var(--accent)" }} />
            ) : (
              <Icon name={favorited ? "heart-fill" : "heart"} size={14}
                    style={{ color: favorited ? "var(--accent)" : "currentColor" }} />
            )}
            {favoritePending ? "Atualizando…" : favorited ? "Favoritado" : "Favoritar"}
          </button>
          <button className="btn ghost sm" onClick={() => onShare(listing)}>
            <Icon name="upload" size={14} /> Compartilhar
          </button>
        </div>
      </header>

      {/* Gallery */}
      <section className="container">
        <div className="detail-gallery">
          {listing.photoTags.slice(0, 5).map((tag, i) => (
            <div
              key={i}
              className={i === 0 ? "detail-gallery-cover" : undefined}
              onClick={() => { setActivePhoto(i); setGalleryOpen(true); }}
              style={{
                cursor: "pointer",
                gridColumn: i === 0 ? "1 / 2" : "auto",
                gridRow: i === 0 ? "1 / 3" : "auto",
                position: "relative",
              }}
            >
              <Photo src={listing.photos[i]?.url} alt={tag} label={tag} style={{ height: "100%", borderRadius: 0 }} />
              {i === 4 && listing.photoTags.length > 5 && (
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(22,22,22,0.55)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 500, fontFamily: "var(--font-display)",
                }}>
                  +{listing.photoTags.length - 5} fotos
                </div>
              )}
              {/* Só aparece no mobile (a galeria colapsa pra 1 foto só) —
                  sem isso, o "tem mais fotos" some junto com os outros tiles. */}
              {i === 0 && listing.photoTags.length > 1 && (
                <div className="detail-gallery-cover-badge" style={{
                  position: "absolute", bottom: 8, left: 8,
                  alignItems: "center", gap: 6,
                  background: "rgba(22,22,22,0.72)", color: "#fff",
                  fontSize: 12, fontWeight: 500,
                  padding: "6px 10px", borderRadius: 999,
                }}>
                  <Icon name="grid" size={13} /> Ver todas as {listing.photoTags.length} fotos
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Two-column content */}
      <section className="container detail-layout" style={{ marginTop: 48 }}>
        <div>
          {/* Quick specs */}
          <div className="detail-specs" style={{ padding: "24px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {[
              { i: "bed", l: "Quartos", v: listing.bedrooms },
              { i: "bath", l: "Banheiros", v: listing.bathrooms },
              { i: "area", l: "Área", v: `${listing.area}m²` },
              { i: "home", l: "Tipo", v: listing.type },
            ].map((s) => (
              <div key={s.l} style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 0 }}>
                <Icon name={s.i} size={18} style={{ color: "var(--ink-3)" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, marginTop: 8 }}>{s.v}</span>
                <span className="mono muted">{s.l}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20 }}>Sobre o imóvel</h2>
            <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 16, lineHeight: 1.65, textWrap: "pretty" }}>
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20 }}>O que tem aqui</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 16 }}>
              {listing.amenities.map((a) => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
                  <Icon name="check" size={14} style={{ color: "var(--accent)" }} />
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* Avaliações do locador */}
          <LandlordReviews landlord={listing.landlord} session={session} contactVersion={contactVersion} />

        </div>

        {/* Sticky sidebar — contact (deixa de ser sticky no mobile, onde a
            coluna vira 1 e "grudar" o card faria menos sentido) */}
        <aside className="detail-sidebar">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600 }}>
                {fmtBRL(listing.price)}
              </span>
              <span className="muted" style={{ fontSize: 14 }}>/mês</span>
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Negociação direta com o proprietário
            </p>

            <div className="div" style={{ margin: "20px 0" }}></div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={listing.landlord.name} size={44} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{listing.landlord.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  No AlugaAlegre desde {listing.landlord.since}
                  {listing.landlord.listings != null &&
                    ` · ${listing.landlord.listings} ${listing.landlord.listings === 1 ? "imóvel" : "imóveis"}`}
                </div>
              </div>
            </div>

            <button className="btn accent lg" style={{ width: "100%", marginTop: 20 }} onClick={() => onContact(listing)}>
              <Icon name="whatsapp" size={16} /> Entrar em contato
            </button>
            <p className="muted" style={{ fontSize: 11, marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
              Um cadastro rápido (30 segundos) libera o contato direto via WhatsApp.
            </p>
          </div>

          <div style={{ marginTop: 16, padding: "16px 20px", border: "1px dashed var(--line-2)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--ink-3)", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Icon name="sparkle" size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
            <span>Imóvel anunciado pelo próprio dono. AlugaAlegre não cobra comissão sobre o aluguel.</span>
          </div>

          <div style={{ marginTop: 14, textAlign: "center" }}>
            <a
              onClick={() => onReport(listing)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", cursor: "pointer" }}
            >
              <Icon name="flag" size={13} /> Denunciar anúncio
            </a>
          </div>
        </aside>
      </section>

      {/* Gallery lightbox */}
      {galleryOpen && (
        <div className="modal-overlay" onClick={() => setGalleryOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}
               style={{ maxWidth: 1080, background: "var(--bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--line)" }}>
              <span className="mono">{activePhoto + 1} / {listing.photoTags.length} · {listing.photoTags[activePhoto]}</span>
              <button className="btn ghost icon sm" onClick={() => setGalleryOpen(false)}>
                <Icon name="close" size={16} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <Photo src={listing.photos[activePhoto]?.url} alt={listing.photoTags[activePhoto]} label={listing.photoTags[activePhoto]} aspect="16 / 10" />
              <div style={{ display: "flex", gap: 8, marginTop: 16, overflow: "auto" }}>
                {listing.photoTags.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    style={{
                      flexShrink: 0, width: 96, height: 64, padding: 0,
                      border: i === activePhoto ? "2px solid var(--ink)" : "1px solid var(--line)",
                      borderRadius: 4, overflow: "hidden", background: "transparent", cursor: "pointer",
                    }}
                  >
                    <Photo src={listing.photos[i]?.url} alt={t} label="" style={{ height: "100%", borderRadius: 0, padding: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

window.Detail = Detail;

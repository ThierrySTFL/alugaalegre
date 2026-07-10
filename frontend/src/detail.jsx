import React from "react";
// Property detail page with photo gallery

const Detail = ({ listing, navigate, onContact, favorited, favoritePending = false, toggleFavorite }) => {
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
            <span>·</span>
            <span className="mono">ID {String(listing.id).toUpperCase()}</span>
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
          <button className="btn ghost sm">
            <Icon name="upload" size={14} /> Compartilhar
          </button>
        </div>
      </header>

      {/* Gallery */}
      <section className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 8,
          aspectRatio: "16 / 9",
          maxHeight: 540,
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          {listing.photoTags.slice(0, 5).map((tag, i) => (
            <div
              key={i}
              onClick={() => { setActivePhoto(i); setGalleryOpen(true); }}
              style={{
                cursor: "pointer",
                gridColumn: i === 0 ? "1 / 2" : "auto",
                gridRow: i === 0 ? "1 / 3" : "auto",
                position: "relative",
              }}
            >
              <Photo label={tag} style={{ height: "100%", borderRadius: 0 }} />
              {i === 4 && listing.photoTags.length > 5 && (
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(22,22,22,0.55)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 500, fontFamily: "var(--font-display)",
                }}>
                  +{listing.photoTags.length - 5} fotos
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Two-column content */}
      <section className="container" style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 64, alignItems: "start" }}>
        <div>
          {/* Quick specs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, padding: "24px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
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


        </div>

        {/* Sticky sidebar — contact */}
        <aside style={{ position: "sticky", top: 88 }}>
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
              <Photo label={listing.photoTags[activePhoto]} aspect="16 / 10" />
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
                    <Photo label="" style={{ height: "100%", borderRadius: 0, padding: 0 }} />
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

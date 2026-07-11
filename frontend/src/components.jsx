import React from "react";
// Shared UI components

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Inline SVG icons — minimal, line-weight matched
const Icon = ({ name, size = 16, stroke = 1.5, ...rest }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" /></>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />,
    "heart-fill": <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" fill="currentColor" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></>,
    bed: <><path d="M3 18V7m18 11v-5a3 3 0 00-3-3H3" /><path d="M3 14h18M7 10V8h4v2" /></>,
    bath: <><path d="M4 11h16v2a4 4 0 01-4 4H8a4 4 0 01-4-4v-2zM6 11V6a2 2 0 012-2h1" /><path d="M9 5l2 2" /></>,
    area: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M9 4v3M4 9h3M20 9h-3M9 20v-3" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    "arrow-left": <path d="M19 12H5M11 18l-6-6 6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    check: <path d="M5 12l4 4 10-10" />,
    edit: <><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M14 6l4 4" /></>,
    trash: <><path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" /><path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    "eye-off": <><path d="M3 3l18 18" /><path d="M10.5 6.2A10.6 10.6 0 0112 6c6.5 0 10 7 10 7a18 18 0 01-3.4 4M6.5 7.5A18.4 18.4 0 002 13s3.5 7 10 7c1.8 0 3.4-.4 4.7-1" /></>,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    grid: <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
    home: <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z" />,
    pin: <><path d="M12 21s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
    chevron: <path d="M9 6l6 6-6 6" />,
    "chevron-down": <path d="M6 9l6 6 6-6" />,
    whatsapp: <><path d="M3 21l1.5-5A8 8 0 1112 20a8 8 0 01-4.5-1.4L3 21z" /><path d="M9 9c0 3 3 6 6 6l1.5-1.5L14 12l-1.5.5L11 11l.5-1.5L10 8 9 9z" fill="currentColor" stroke="none" /></>,
    upload: <><path d="M12 16V4M6 10l6-6 6 6" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /></>,
    more: <><circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
    star: <path d="M12 4l2.5 5.2 5.5.8-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.5-.8L12 4z" />,
    "star-fill": <path d="M12 4l2.5 5.2 5.5.8-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.5-.8L12 4z" fill="currentColor" />,
    flag: <path d="M6 21V4m0 1h12l-3 4 3 4H6" />,
    sparkle: <path d="M12 4v5m0 6v5M4 12h5m6 0h5M7 7l3 3m4 4l3 3M17 7l-3 3m-4 4l-3 3" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name] || null}
    </svg>
  );
};

// Logo
const Logo = ({ onClick }) => (
  <a className="logo" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
    <span className="mark"></span>
    <span>aluga<span style={{ color: "var(--accent)" }}>alegre</span></span>
  </a>
);

// Photo: mostra a imagem real quando há `src`; senão, cai no placeholder
// listrado com legenda (usado por dados mock e fotos decorativas).
const Photo = ({ label, src, alt, height = 220, aspect, style = {}, onClick, children }) => (
  <div className="photo" onClick={onClick}
    style={{ height: aspect ? "auto" : height, aspectRatio: aspect, cursor: onClick ? "pointer" : undefined, ...style }}>
    {src
      ? <img src={src} alt={alt || label || ""} loading="lazy" />
      : label && <span className="lbl">{label}</span>}
    {children}
  </div>
);

// Top navigation
const Nav = ({ view, navigate, session, onAuth, onSignOut }) => {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo onClick={() => navigate("home")} />
        <nav className="nav-links">
          <a className={view === "home" ? "active" : ""} onClick={() => navigate("home")}>Buscar imóveis</a>
          <a
            className={view === "dashboard" || view === "add" ? "active" : ""}
            onClick={() => session?.role === "landlord" ? navigate("dashboard") : onAuth("landlord")}
          >
            Sou locador
          </a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mono muted nav-role-label">{session.role === "landlord" ? "Locador" : "Cliente"}</span>
              <Avatar name={session.name} />
              <button className="btn ghost sm" onClick={onSignOut}>Sair</button>
            </div>
          ) : (
            <>
              <button className="btn ghost sm" onClick={() => onAuth(null)}>Entrar</button>
              <button className="btn sm nav-cta-landlord" onClick={() => onAuth("landlord")}>Anunciar imóvel</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// Avatar circle with initials
const Avatar = ({ name, size = 32 }) => {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--accent)", color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 600, fontFamily: "var(--font-display)",
    }}>{initials}</span>
  );
};

// Footer
const Footer = () => (
  <footer style={{ marginTop: 80, borderTop: "1px solid var(--line)", padding: "40px 0 32px" }}>
    <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
      <Logo />
      <p className="muted" style={{ fontSize: 13, maxWidth: 360 }}>
        Aluguel direto entre locador e locatário, sem intermediários.
      </p>
      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
        © 2026 AlugaAlegre — todos os direitos reservados.
      </span>
    </div>
  </footer>
);

// Format BRL
const fmtBRL = (n) =>
  "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

// Toast hook
const useToast = () => {
  const [msg, setMsg] = useState(null);
  const show = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2400);
  };
  const node = msg ? <div className="toast">{msg}</div> : null;
  return [node, show];
};

// Listing card (editorial, photo-forward)
const ListingCard = ({ listing, onOpen, onFavorite, favorited, favoritePending = false }) => (
  <article
    style={{ display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }}
    onClick={() => onOpen(listing)}
  >
    <div style={{ position: "relative" }}>
      <Photo src={listing.coverUrl} alt={listing.title} label={listing.photoTags[0]} aspect="4 / 3" />
      <button
        className="btn icon"
        onClick={(e) => { e.stopPropagation(); onFavorite(listing.id); }}
        disabled={favoritePending}
        style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(253, 252, 249, 0.92)", color: "var(--ink)",
          border: "none", width: 36, height: 36, borderRadius: "50%",
          opacity: favoritePending ? 0.7 : 1,
          cursor: favoritePending ? "wait" : "pointer",
        }}
      >
        {favoritePending ? (
          <span className="spinner" style={{ width: 16, height: 16, color: "var(--accent)" }} />
        ) : (
          <Icon name={favorited ? "heart-fill" : "heart"} size={16}
                style={{ color: favorited ? "var(--accent)" : "var(--ink)" }} />
        )}
      </button>
      <span className="pill sun" style={{ position: "absolute", top: 12, left: 12 }}>
        {listing.type}
      </span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <h3 style={{ fontSize: 17, lineHeight: 1.2, flex: 1 }}>{listing.title}</h3>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, whiteSpace: "nowrap" }}>
        {fmtBRL(listing.price)}
        <span style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-3)" }}>/mês</span>
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--ink-3)", fontSize: 13 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon name="pin" size={13} /> {listing.neighborhood}, {listing.city.split(",")[1].trim()}
      </span>
      <span>·</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon name="bed" size={13} /> {listing.bedrooms}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon name="bath" size={13} /> {listing.bathrooms}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon name="area" size={13} /> {listing.area}m²
      </span>
    </div>
  </article>
);

Object.assign(window, {
  Icon, Logo, Photo, Nav, Avatar, Footer, fmtBRL, useToast, ListingCard,
});

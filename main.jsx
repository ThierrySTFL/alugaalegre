/** @jsxRuntime classic */
import React from "react";
import ReactDOM from "react-dom/client";

import "./tweaks-panel.jsx";
import "./data.jsx";
import "./components.jsx";
import "./modals.jsx";
import "./home.jsx";
import "./detail.jsx";
import "./dashboard.jsx";
import "./add-property.jsx";
import "./auth.jsx";

// App shell — view switcher + tweaks panel

const { Home, Detail, Dashboard, AddProperty, AuthModal, ContactModal,
        Nav, Footer, useToast } = window;

const TWEAK_DEFAULTS = window.__TWEAKS__;

const App = () => {
  const [view, setView] = React.useState("home"); // home / detail / dashboard / add
  const [currentListing, setCurrentListing] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [showContact, setShowContact] = React.useState(false);
  const [contactListing, setContactListing] = React.useState(null);
  // showAuth: null (fechado) | "landlord" | "client" | "any"
  const [showAuth, setShowAuth] = React.useState(null);
  const [favorites, setFavorites] = React.useState(new Set());
  const [toast, showToast] = useToast();

  const [ownListings, setOwnListings] = React.useState(
    window.DATA.LISTINGS.filter((l) => l.landlord.name === window.DATA.DEMO_LANDLORD)
  );

  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.dataset.palette = t.palette;
    document.documentElement.dataset.type = t.type;
    document.documentElement.dataset.density = t.density;
  }, [t.palette, t.type, t.density]);

  const navigate = (next) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };
  window.__navigate = navigate;

  const openProperty = (listing) => {
    setCurrentListing(listing);
    navigate("detail");
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("Removido dos favoritos"); }
      else { next.add(id); showToast("Adicionado aos favoritos"); }
      return next;
    });
  };

  const handleContact = (listing) => {
    setContactListing(listing);
    setShowContact(true);
  };

  // Callback unificado de auth — role: "landlord" | "client"
  const handleAuth = (info) => {
    const newSession = { name: info.name, email: info.email, role: info.role };
    setSession(newSession);
    setShowAuth(null);
    if (info.role === "landlord") {
      navigate("dashboard");
      showToast(`Bem-vindo, ${info.name.split(" ")[0]}!`);
    } else {
      showToast(`Olá, ${info.name.split(" ")[0]}! Agora você pode ver contatos de locadores.`);
    }
  };

  const handleSignOut = () => {
    setSession(null);
    navigate("home");
    showToast("Sessão encerrada");
  };

  // Quando o ContactModal libera o contato, cria sessão de cliente se ainda não houver
  const handleUnlock = (info) => {
    if (!session) setSession({ name: info.name, email: info.email, role: "client" });
    showToast(`Contato liberado!`);
  };

  const handleCreateProperty = (listing) => {
    setOwnListings((prev) => [{ ...listing }, ...prev]);
    showToast("Imóvel publicado!");
  };

  return (
    <div className="app" data-screen-label={`AlugaAlegre / ${view}`}>
      <Nav
        view={view}
        navigate={navigate}
        session={session}
        onAuth={(preRole) => setShowAuth(preRole || "any")}
        onSignOut={handleSignOut}
      />

      {view === "home" && (
        <Home
          navigate={navigate}
          openProperty={openProperty}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
      {view === "detail" && currentListing && (
        <Detail
          listing={currentListing}
          navigate={navigate}
          onContact={handleContact}
          favorited={favorites.has(currentListing.id)}
          toggleFavorite={toggleFavorite}
        />
      )}
      {view === "dashboard" && session?.role === "landlord" && (
        <Dashboard
          session={session}
          navigate={navigate}
          ownListings={ownListings}
          setOwnListings={setOwnListings}
          openProperty={openProperty}
        />
      )}
      {view === "dashboard" && !session && (
        <div className="container" style={{ padding: "80px 32px", textAlign: "center" }}>
          <p className="muted">Você precisa entrar como locador.</p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setShowAuth("landlord")}>
            Entrar como locador
          </button>
        </div>
      )}
      {view === "add" && session?.role === "landlord" && (
        <AddProperty navigate={navigate} onCreate={handleCreateProperty} />
      )}

      <Footer />

      {/* Modals */}
      {showContact && contactListing && (
        <ContactModal
          listing={contactListing}
          session={session}
          onClose={() => setShowContact(false)}
          onUnlock={handleUnlock}
        />
      )}
      {showAuth && (
        <AuthModal
          preRole={showAuth === "any" ? null : showAuth}
          onClose={() => setShowAuth(null)}
          onAuth={handleAuth}
        />
      )}

      {toast}

      {/* Tweaks panel */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Paleta">
          <window.TweakRadio
            label="Tema"
            value={t.palette}
            onChange={(v) => setTweak("palette", v)}
            options={[
              { value: "navy", label: "Navy" },
              { value: "forest", label: "Verde" },
              { value: "warm", label: "Terra" },
              { value: "mono", label: "Mono" },
            ]}
          />
        </window.TweakSection>
        <window.TweakSection label="Tipografia">
          <window.TweakRadio
            label="Display"
            value={t.type}
            onChange={(v) => setTweak("type", v)}
            options={[
              { value: "geometric", label: "Geom." },
              { value: "editorial", label: "Serif" },
              { value: "humanist", label: "Human." },
            ]}
          />
        </window.TweakSection>
        <window.TweakSection label="Densidade">
          <window.TweakRadio
            label="Espaçamento"
            value={t.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "compact", label: "Compacto" },
              { value: "comfortable", label: "Padrão" },
              { value: "spacious", label: "Solto" },
            ]}
          />
        </window.TweakSection>
        <window.TweakSection label="Atalhos de navegação">
          <window.TweakButton label="→ Home pública" onClick={() => navigate("home")} />
          <window.TweakButton label="→ AuthModal (qualquer)" onClick={() => setShowAuth("any")} />
          <window.TweakButton label="→ Login + dashboard (Marina)" onClick={() => handleAuth({ name: "Marina Toledo", email: "marina@gmail.com", role: "landlord" })} />
          <window.TweakButton label="→ Login como cliente (Lucas)" onClick={() => handleAuth({ name: "Lucas Ferreira", email: "lucas@gmail.com", role: "client" })} />
          <window.TweakButton label="→ Adicionar imóvel" onClick={() => { if (!session) handleAuth({ name: "Marina Toledo", email: "marina@gmail.com", role: "landlord" }); setTimeout(() => navigate("add"), 50); }} />
          <window.TweakButton label="→ Detalhe do imóvel" onClick={() => openProperty(window.DATA.LISTINGS[0])} />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

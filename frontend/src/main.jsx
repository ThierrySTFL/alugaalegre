/** @jsxRuntime classic */
import React from "react";
import ReactDOM from "react-dom/client";

import "./supabase.jsx";
import "./api.js";
import "./data.jsx";
import "./components.jsx";
import "./modals.jsx";
import "./home.jsx";
import "./detail.jsx";
import "./dashboard.jsx";
import "./add-property.jsx";
import "./auth.jsx";

// App shell — view switcher

const { Home, Detail, Dashboard, AddProperty, AuthModal, ContactModal,
        Nav, Footer, useToast } = window;

const App = () => {
  const [view, setView] = React.useState("home"); // home / detail / dashboard / add
  const [currentListing, setCurrentListing] = React.useState(null);
  const [session, setSession] = React.useState(null);
  // Restaurando a sessão a partir do token guardado (evita piscar "deslogado" no F5).
  const [restoring, setRestoring] = React.useState(() => !!window.api.getToken());
  const [showContact, setShowContact] = React.useState(false);
  const [contactListing, setContactListing] = React.useState(null);
  // showAuth: null (fechado) | "landlord" | "client" | "any"
  const [showAuth, setShowAuth] = React.useState(null);
  const [favorites, setFavorites] = React.useState(new Set());
  // ids com um POST /favoritos em andamento — evita disparar dois toggles
  // pro mesmo imóvel enquanto o primeiro ainda não respondeu.
  const [pendingFavorites, setPendingFavorites] = React.useState(new Set());
  // id que o usuário tentou favoritar sem estar logado; retomado após o login.
  const [favoriteAfterAuth, setFavoriteAfterAuth] = React.useState(null);
  const [toast, showToast] = useToast();

  // Ao carregar: se há token guardado, reconstrói a sessão via GET /auth/me.
  React.useEffect(() => {
    if (!window.api.getToken()) return;
    let ativo = true;
    window.api
      .me()
      .then((eu) => {
        if (ativo) {
          setSession({
            name: eu.nome,
            email: eu.email,
            role: eu.is_locador ? "landlord" : "client",
          });
        }
      })
      .catch((err) => {
        // Só descarta o token se ele for realmente inválido/expirado (401).
        // Erro de rede/CORS/servidor: mantém o token para a próxima tentativa.
        if (err.status === 401) window.api.clearToken();
      })
      .finally(() => ativo && setRestoring(false));
    return () => { ativo = false; };
  }, []);

  // Sincroniza os favoritos com a API sempre que a sessão muda (login,
  // restauração do token no F5, ou logout — que limpa a lista local).
  // Se havia um favorito pendente de login, resolve ele aqui também, usando
  // a MESMA busca (uma única GET /favoritos) — rodar isso num efeito à parte
  // criaria uma segunda busca concorrente que poderia sobrescrever o toggle
  // otimista com uma resposta desatualizada.
  React.useEffect(() => {
    if (!session) { setFavorites(new Set()); return; }
    let ativo = true;
    window.api
      .listarFavoritos()
      .then((ids) => {
        if (!ativo) return;
        setFavorites(new Set(ids));
        if (favoriteAfterAuth != null) {
          const id = favoriteAfterAuth;
          setFavoriteAfterAuth(null);
          if (ids.includes(id)) showToast("Esse imóvel já estava nos seus favoritos");
          else applyFavoriteToggle(id, false);
        }
      })
      .catch(() => {
        // Falha silenciosa na sincronização de fundo, exceto quando havia um
        // favorito pendente de login — aí o usuário fez uma ação explícita
        // (clicou favoritar) e precisa saber que ela não foi concluída.
        if (!ativo || favoriteAfterAuth == null) return;
        setFavoriteAfterAuth(null);
        showToast("Não foi possível favoritar o imóvel. Tente de novo.");
      });
    return () => { ativo = false; };
  }, [session]);

  const navigate = (next) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };
  window.__navigate = navigate;

  const openProperty = (listing) => {
    setCurrentListing(listing);
    navigate("detail");
  };

  const openAuth = (preRole) => setShowAuth(preRole || "any");

  // wasFavorited vem explícito (não do estado) pra não sofrer de closure
  // desatualizada quando chamado logo após um login (ver efeito acima).
  const applyFavoriteToggle = async (id, wasFavorited) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(id); else next.add(id);
      return next;
    });
    setPendingFavorites((prev) => new Set(prev).add(id));
    try {
      const res = await window.api.toggleFavorito(id);
      showToast(res.favoritado ? "Adicionado aos favoritos" : "Removido dos favoritos");
    } catch (err) {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.add(id); else next.delete(id);
        return next;
      });
      showToast(err.message || "Não foi possível atualizar seus favoritos.");
    } finally {
      setPendingFavorites((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const toggleFavorite = (id) => {
    if (pendingFavorites.has(id)) return; // já tem um toggle em andamento
    if (!session) {
      setFavoriteAfterAuth(id);
      openAuth("any");
      return;
    }
    applyFavoriteToggle(id, favorites.has(id));
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
    // Havia um favorito pendente de login: o efeito acima resolve ele com a
    // lista real de favoritos, então não navega nem mostra o toast padrão
    // (manteria o usuário no imóvel que ele estava tentando favoritar).
    if (favoriteAfterAuth != null) return;
    if (info.role === "landlord") {
      navigate("dashboard");
      showToast(`Bem-vindo, ${info.name.split(" ")[0]}!`);
    } else {
      showToast(`Olá, ${info.name.split(" ")[0]}! Agora você pode ver contatos de locadores.`);
    }
  };

  const handleSignOut = () => {
    window.api.clearToken();
    setSession(null);
    navigate("home");
    showToast("Sessão encerrada");
  };

  // Quando o ContactModal libera o contato, cria sessão de cliente se ainda não houver
  const handleUnlock = (info) => {
    if (!session) setSession({ name: info.name, email: info.email, role: "client" });
    showToast(`Contato liberado!`);
  };

  if (restoring) {
    return (
      <div className="app" style={{ alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" style={{ width: 28, height: 28, color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="app" data-screen-label={`AlugaAlegre / ${view}`}>
      <Nav
        view={view}
        navigate={navigate}
        session={session}
        onAuth={openAuth}
        onSignOut={handleSignOut}
      />

      {view === "home" && (
        <Home
          navigate={navigate}
          openProperty={openProperty}
          favorites={favorites}
          pendingFavorites={pendingFavorites}
          toggleFavorite={toggleFavorite}
          session={session}
          onAuth={openAuth}
        />
      )}
      {view === "detail" && currentListing && (
        <Detail
          listing={currentListing}
          navigate={navigate}
          onContact={handleContact}
          favorited={favorites.has(currentListing.id)}
          favoritePending={pendingFavorites.has(currentListing.id)}
          toggleFavorite={toggleFavorite}
        />
      )}
      {view === "dashboard" && session?.role === "landlord" && (
        <Dashboard
          session={session}
          navigate={navigate}
          openProperty={openProperty}
          showToast={showToast}
        />
      )}
      {view === "dashboard" && !session && (
        <div className="container" style={{ padding: "80px 32px", textAlign: "center" }}>
          <p className="muted">Você precisa entrar como locador.</p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => openAuth("landlord")}>
            Entrar como locador
          </button>
        </div>
      )}
      {view === "add" && session?.role === "landlord" && (
        <AddProperty navigate={navigate} />
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
          onClose={() => { setShowAuth(null); setFavoriteAfterAuth(null); }}
          onAuth={handleAuth}
        />
      )}

      {toast}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

/** @jsxRuntime classic */
import React from "react";
import ReactDOM from "react-dom/client";

import "./supabase.jsx";
import "./api.js";
import "./components.jsx";
import "./modals.jsx";
import "./home.jsx";
import "./detail.jsx";
import "./dashboard.jsx";
import "./admin.jsx";
import "./add-property.jsx";
import "./auth.jsx";

// App shell — view switcher

const { Home, Detail, Dashboard, AdminPanel, AddProperty, AuthModal, ContactModal,
        ReportModal, Nav, Footer, useToast } = window;

const setListingParam = (id, { replace = false } = {}) => {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("imovel", id);
  else url.searchParams.delete("imovel");
  window.history[replace ? "replaceState" : "pushState"]({}, "", url);
};

const listingUrl = (id) => {
  const url = new URL(window.location.href);
  url.searchParams.set("imovel", id);
  return url.toString();
};

const App = () => {
  const [view, setView] = React.useState("home"); // home / detail / dashboard / add
  const [currentListing, setCurrentListing] = React.useState(null);
  const [session, setSession] = React.useState(null);
  // Restaurando a sessão a partir do token guardado (evita piscar "deslogado" no F5).
  const [restoring, setRestoring] = React.useState(() => !!window.api.getToken());
  const [showContact, setShowContact] = React.useState(false);
  const [contactListing, setContactListing] = React.useState(null);
  // Anúncio sendo denunciado (null = modal fechado).
  const [reportListing, setReportListing] = React.useState(null);
  // showAuth: null (fechado) | "landlord" | "client" | "any"
  const [showAuth, setShowAuth] = React.useState(null);
  const [favorites, setFavorites] = React.useState(new Set());
  // ids com um POST /favoritos em andamento — evita disparar dois toggles
  // pro mesmo imóvel enquanto o primeiro ainda não respondeu.
  const [pendingFavorites, setPendingFavorites] = React.useState(new Set());
  // id que o usuário tentou favoritar sem estar logado; retomado após o login.
  const [favoriteAfterAuth, setFavoriteAfterAuth] = React.useState(null);
  // Incrementado a cada contato liberado — força o Detail a reavaliar se o
  // usuário já pode avaliar o locador (ver handleUnlock).
  const [contactVersion, setContactVersion] = React.useState(0);
  const [toast, showToast] = useToast();

  // Ao carregar com ?imovel=ID, abre o detalhe diretamente. O popstate mantém
  // a view sincronizada quando o usuário usa voltar/avançar do navegador.
  React.useEffect(() => {
    const abrirImovelDaUrl = (avisarErro = false) => {
      const id = new URLSearchParams(window.location.search).get("imovel");
      if (!id) {
        setCurrentListing(null);
        setView("home");
        return;
      }
      window.api
        .detalheImovel(id)
        .then((anuncio) => {
          setCurrentListing(window.adaptAnuncio(anuncio));
          setView("detail");
          window.scrollTo({ top: 0 });
        })
        .catch(() => {
          setCurrentListing(null);
          setView("home");
          setListingParam(null, { replace: true });
          if (avisarErro) showToast("Anúncio não encontrado ou indisponível.");
        });
    };

    abrirImovelDaUrl(true);
    const onPopState = () => abrirImovelDaUrl(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
            isAdmin: eu.is_admin,
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
    if (next === "home") {
      setCurrentListing(null);
      setListingParam(null);
    }
    setView(next);
    window.scrollTo({ top: 0 });
  };
  window.__navigate = navigate;

  const openProperty = (listing) => {
    setCurrentListing(listing);
    setListingParam(listing.id);
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

  // Denúncia exige login: sem sessão, abre o AuthModal — depois de entrar, o
  // usuário clica no link de novo (sem retomada automática, como nos favoritos).
  const handleReport = (listing) => {
    if (!session) {
      openAuth("any");
      return;
    }
    setReportListing(listing);
  };

  const handleShare = async (listing) => {
    const url = listingUrl(listing.id);
    const data = {
      title: listing.title,
      text: `${listing.title} no AlugaAlegre`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link do anúncio copiado.");
    } catch (err) {
      if (err?.name === "AbortError") return;
      showToast("Não foi possível compartilhar o anúncio.");
    }
  };

  // Callback unificado de auth — role: "landlord" | "client"
  const handleAuth = (info) => {
    const newSession = { name: info.name, email: info.email, role: info.role, isAdmin: !!info.isAdmin };
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
    // Sinaliza pro Detail reavaliar a elegibilidade de avaliação — sem isso o
    // botão "Avaliar" só aparece depois de recarregar a página, já que o
    // contato foi liberado depois do check original de elegibilidade.
    setContactVersion((v) => v + 1);
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
          onReport={handleReport}
          onShare={handleShare}
          favorited={favorites.has(currentListing.id)}
          favoritePending={pendingFavorites.has(currentListing.id)}
          toggleFavorite={toggleFavorite}
          session={session}
          contactVersion={contactVersion}
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
      {view === "admin" && (
        session?.isAdmin ? (
          <AdminPanel showToast={showToast} openProperty={openProperty} />
        ) : (
          <div className="container" style={{ padding: "80px 32px", textAlign: "center" }}>
            <p className="muted">Acesso restrito a administradores.</p>
          </div>
        )
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
      {reportListing && (
        <ReportModal
          listing={reportListing}
          onClose={() => setReportListing(null)}
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

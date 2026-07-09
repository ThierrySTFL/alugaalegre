import React from "react";

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validatePhone = (v) => v.replace(/\D/g, "").length >= 10;

const formatPhone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const formatCPF = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const ModalShell = ({ children, onClose, size = "" }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className={"modal " + (size === "lg" ? "modal-lg" : "")} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// ─── EmailAuthForm ────────────────────────────────────────────────────────────
// Form de e-mail + senha (login/cadastro) que fala direto com o backend.
// Cuida do token (setToken) e devolve ao pai o resultado normalizado:
//   login:  { mode: "login",  name, email, isLocador }
//   signup: { mode: "signup", name, email }
// O pai decide o que fazer com o papel (cliente/locador) e a navegação.

const EmailAuthForm = ({ onResult, defaultMode = "login", roleSlot = null }) => {
  const [mode, setMode] = React.useState(defaultMode);
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [showSenha, setShowSenha] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [erroGeral, setErroGeral] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const isSignup = mode === "signup";

  const trocarModo = (m) => {
    setMode(m);
    setErrors({});
    setErroGeral(null);
  };

  const submit = async () => {
    const e = {};
    if (isSignup && nome.trim().length < 2) e.nome = "Informe seu nome completo.";
    if (!validateEmail(email)) e.email = "E-mail inválido.";
    if (senha.length < 6) e.senha = "A senha precisa ter ao menos 6 caracteres.";
    setErrors(e);
    setErroGeral(null);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      if (isSignup) {
        const tok = await window.api.cadastro(nome.trim(), email.trim(), senha);
        window.api.setToken(tok.access_token);
        await onResult({ mode: "signup", name: nome.trim(), email: email.trim() });
      } else {
        const tok = await window.api.login(email.trim(), senha);
        window.api.setToken(tok.access_token);
        const eu = await window.api.me();
        await onResult({
          mode: "login",
          name: eu.nome,
          email: eu.email,
          isLocador: eu.is_locador,
        });
      }
    } catch (err) {
      setErroGeral(err.message || "Não foi possível continuar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (ev) => {
    if (ev.key === "Enter" && !loading) submit();
  };

  return (
    <div style={{ padding: "20px 24px 24px" }}>
      {/* Alternância login / cadastro */}
      <div className="tabs" style={{ display: "flex", width: "100%", marginBottom: 18 }}>
        <button className={!isSignup ? "active" : ""} style={{ flex: 1 }} onClick={() => trocarModo("login")}>
          Entrar
        </button>
        <button className={isSignup ? "active" : ""} style={{ flex: 1 }} onClick={() => trocarModo("signup")}>
          Criar conta
        </button>
      </div>

      {isSignup && roleSlot}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} onKeyDown={onKeyDown}>
        {isSignup && (
          <div className="field">
            <label>Nome completo<span className="req">*</span></label>
            <input
              className={"input" + (errors.nome ? " invalid" : "")}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              autoFocus
            />
            {errors.nome && <span className="err">{errors.nome}</span>}
          </div>
        )}

        <div className="field">
          <label>E-mail<span className="req">*</span></label>
          <input
            className={"input" + (errors.email ? " invalid" : "")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoFocus={!isSignup}
          />
          {errors.email && <span className="err">{errors.email}</span>}
        </div>

        <div className="field">
          <label>Senha<span className="req">*</span></label>
          <div style={{ position: "relative" }}>
            <input
              className={"input" + (errors.senha ? " invalid" : "")}
              type={showSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={isSignup ? "Mínimo 6 caracteres" : "Sua senha"}
              style={{ paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowSenha((s) => !s)}
              aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", padding: 6, color: "var(--ink-3)",
                display: "flex", alignItems: "center",
              }}
            >
              <Icon name={showSenha ? "eye-off" : "eye"} size={16} />
            </button>
          </div>
          {errors.senha && <span className="err">{errors.senha}</span>}
        </div>

        {erroGeral && (
          <div className="err" style={{ fontSize: 13 }}>{erroGeral}</div>
        )}

        <button
          className="btn accent lg"
          style={{ width: "100%", marginTop: 4 }}
          onClick={submit}
          disabled={loading}
        >
          {loading
            ? <><span className="spinner" /> {isSignup ? "Criando conta…" : "Entrando…"}</>
            : isSignup ? "Criar conta" : "Entrar"}
        </button>
      </div>

      <p className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 14 }}>
        {isSignup ? (
          <>Já tem conta? <a className="link" style={{ cursor: "pointer" }} onClick={() => trocarModo("login")}>Entrar</a></>
        ) : (
          <>Ainda não tem conta? <a className="link" style={{ cursor: "pointer" }} onClick={() => trocarModo("signup")}>Criar agora</a></>
        )}
      </p>
    </div>
  );
};

// ─── ContactModal ─────────────────────────────────────────────────────────────
// Se o usuário já está logado → mostra o WhatsApp direto.
// Se não → form de e-mail/senha → revela o WhatsApp e cria sessão de cliente.

const ContactModal = ({ listing, onClose, onUnlock, session }) => {
  const jaLogado = !!session;
  const [step, setStep] = React.useState(jaLogado ? "reveal" : "prompt");
  const [clientName, setClientName] = React.useState(session?.name || "");

  React.useEffect(() => {
    if (jaLogado) onUnlock?.({ name: session.name, email: session.email, role: "client" });
  }, []);

  const handleResult = (r) => {
    setClientName(r.name);
    onUnlock?.({ name: r.name, email: r.email, role: "client" });
    setStep("reveal");
  };

  if (step === "prompt") {
    return (
      <ModalShell onClose={onClose}>
        <div style={{ padding: "28px 28px 4px", borderBottom: "1px solid var(--line-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="mono" style={{ color: "var(--accent)" }}>● Entrar em contato</span>
            <button className="btn ghost icon sm" onClick={onClose}><Icon name="close" size={14} /></button>
          </div>
          <h2 style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.02em", marginTop: 10 }}>
            Falta pouco para falar<br />com {listing.landlord.name.split(" ")[0]}.
          </h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 8, marginBottom: 16 }}>
            Entre ou crie sua conta para liberar o WhatsApp do locador.
          </p>
        </div>
        <EmailAuthForm onResult={handleResult} />
      </ModalShell>
    );
  }

  // step === "reveal"
  return (
    <ModalShell onClose={onClose}>
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--accent-soft)", color: "var(--accent)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="check" size={24} stroke={2} />
        </div>
        <h2 style={{ fontSize: 22, marginTop: 14, letterSpacing: "-0.02em" }}>Contato liberado!</h2>
        <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          {clientName ? `Olá, ${clientName.split(" ")[0]}! ` : ""}
          Avisamos {listing.landlord.name.split(" ")[0]} que você tem interesse.
        </p>

        <div className="card" style={{ padding: 20, marginTop: 22, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={listing.landlord.name} size={44} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{listing.landlord.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>Locador · responde em ~3h</div>
            </div>
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono muted">WhatsApp</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "-0.01em" }}>
              {listing.landlord.phone}
            </span>
          </div>
        </div>

        <a
          className="btn lg"
          style={{ width: "100%", marginTop: 18, background: "#25D366", borderColor: "#25D366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          href={`https://wa.me/${listing.landlord.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${listing.landlord.name.split(" ")[0]}! Vi seu anúncio "${listing.title}" no AlugaAlegre e fiquei interessado(a). Podemos conversar?`)}`}
          target="_blank" rel="noopener"
          onClick={onClose}
        >
          <Icon name="whatsapp" size={16} /> Abrir conversa no WhatsApp
        </a>
        <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={onClose}>Fechar</button>
      </div>
    </ModalShell>
  );
};

// ─── AuthModal ────────────────────────────────────────────────────────────────
// Login/cadastro por e-mail + senha. Locador novo completa o perfil (CPF + tel).
// O papel (cliente/locador) vem do backend no login (is_locador) e da escolha
// no cadastro.

const AuthModal = ({ onClose, onAuth, preRole = null }) => {
  const [step, setStep] = React.useState("auth"); // "auth" | "complete"
  const [signupRole, setSignupRole] = React.useState(preRole || "client");
  const [pendente, setPendente] = React.useState(null); // { name, email } levado ao complete
  const [CPF, setCPF] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [erroGeral, setErroGeral] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const finalizar = (name, email, role) => {
    onAuth({ name, email, role });
    onClose();
  };

  const handleResult = (r) => {
    if (r.mode === "login") {
      if (r.isLocador) return finalizar(r.name, r.email, "landlord");
      // Logou mas ainda não é locador. Se veio pelo caminho de locador, completa o perfil.
      if (preRole === "landlord") {
        setPendente({ name: r.name, email: r.email });
        setStep("complete");
        return;
      }
      return finalizar(r.name, r.email, "client");
    }
    // cadastro
    if (signupRole === "landlord") {
      setPendente({ name: r.name, email: r.email });
      setStep("complete");
      return;
    }
    return finalizar(r.name, r.email, "client");
  };

  const handleComplete = async () => {
    const e = {};
    if (CPF.replace(/\D/g, "").length !== 11) e.CPF = "CPF inválido.";
    if (!validatePhone(phone)) e.phone = "Telefone com DDD obrigatório.";
    setErrors(e);
    setErroGeral(null);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const telefone = Number(phone.replace(/\D/g, ""));
      await window.api.completarPerfil(CPF.replace(/\D/g, ""), telefone);
      finalizar(pendente.name, pendente.email, "landlord");
    } catch (err) {
      setErroGeral(err.message || "Não foi possível salvar seu perfil.");
    } finally {
      setSaving(false);
    }
  };

  // Escolha de papel no cadastro (só quando o contexto não já define)
  const roleSlot = !preRole ? (
    <div style={{ marginBottom: 14 }}>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Como você quer usar?</label>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {[
          { r: "client", label: "Quero alugar" },
          { r: "landlord", label: "Tenho imóvel" },
        ].map(({ r, label }) => (
          <button
            key={r}
            onClick={() => setSignupRole(r)}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: "var(--radius)",
              border: "1.5px solid " + (signupRole === r ? "var(--ink)" : "var(--line-2)"),
              background: signupRole === r ? "var(--bg-2)" : "none",
              fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--ink)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <ModalShell onClose={onClose}>
      {step === "auth" && (
        <>
          <div style={{ padding: "24px 24px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ color: "var(--accent)" }}>● AlugaAlegre</span>
              <button className="btn ghost icon sm" onClick={onClose}><Icon name="close" size={14} /></button>
            </div>
            <h2 style={{ fontSize: 22, letterSpacing: "-0.02em", marginTop: 12 }}>
              {preRole === "landlord" ? "Acesse sua conta de locador" : "Bem-vindo ao AlugaAlegre"}
            </h2>
          </div>
          <EmailAuthForm
            onResult={handleResult}
            defaultMode="login"
            roleSlot={roleSlot}
          />
        </>
      )}

      {step === "complete" && (
        <div style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22,
                        padding: "12px 16px", background: "var(--bg-2)", borderRadius: 10 }}>
            <Avatar name={pendente?.name} size={38} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{pendente?.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{pendente?.email}</div>
            </div>
          </div>
          <h2 style={{ fontSize: 20, letterSpacing: "-0.01em" }}>Complete seu perfil de locador</h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 22 }}>
            Precisamos de mais alguns dados para ativar sua conta.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label>CPF<span className="req">*</span></label>
              <input
                className={"input" + (errors.CPF ? " invalid" : "")}
                value={CPF}
                onChange={(e) => setCPF(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                autoFocus
              />
              {errors.CPF && <span className="err">{errors.CPF}</span>}
            </div>
            <div className="field">
              <label>Celular (WhatsApp)<span className="req">*</span></label>
              <input
                className={"input" + (errors.phone ? " invalid" : "")}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(28) 99999-0000"
                inputMode="tel"
              />
              {errors.phone && <span className="err">{errors.phone}</span>}
              <span className="muted" style={{ fontSize: 11 }}>
                Esse número será visto pelos interessados no seu imóvel.
              </span>
            </div>
          </div>
          {erroGeral && <div className="err" style={{ fontSize: 13, marginTop: 14 }}>{erroGeral}</div>}
          <button
            className="btn accent lg"
            style={{ width: "100%", marginTop: 24 }}
            onClick={handleComplete}
            disabled={saving}
          >
            {saving
              ? <><span className="spinner" /> Salvando…</>
              : <>Criar conta de locador <Icon name="arrow" size={14} /></>}
          </button>
        </div>
      )}
    </ModalShell>
  );
};

window.ContactModal  = ContactModal;
window.AuthModal     = AuthModal;
window.ModalShell    = ModalShell;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;

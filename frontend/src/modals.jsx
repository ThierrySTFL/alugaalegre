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

// Contas demo para simular o Google OAuth
const GOOGLE_ACCOUNTS = [
  { name: "Lucas Ferreira", email: "lucas@gmail.com"   },
  { name: "Beatriz Nunes",  email: "bea@gmail.com"     },
  { name: "Marina Toledo",  email: "marina@gmail.com"  },
];

// Simulação do seletor de conta Google
const GooglePicker = ({ onSelect, onBack, loading }) => {
  const [showCustom, setShowCustom] = React.useState(false);
  const [customName, setCustomName] = React.useState("");
  const [customEmail, setCustomEmail] = React.useState("");

  const canSubmitCustom = customName.trim().length >= 2 && validateEmail(customEmail);

  return (
    <div>
      {/* Cabeçalho estilo Google */}
      <div style={{ textAlign: "center", padding: "28px 24px 20px", borderBottom: "1px solid var(--line-2)" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 10 }}>
          <span style={{ color: "#4285F4" }}>G</span>
          <span style={{ color: "#EA4335" }}>o</span>
          <span style={{ color: "#FBBC05" }}>o</span>
          <span style={{ color: "#4285F4" }}>g</span>
          <span style={{ color: "#34A853" }}>l</span>
          <span style={{ color: "#EA4335" }}>e</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Escolha uma conta</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>para continuar no AlugaAlegre</div>
      </div>

      {/* Lista de contas */}
      {GOOGLE_ACCOUNTS.map((acc) => (
        <button
          key={acc.email}
          onClick={() => !loading && onSelect(acc)}
          style={{
            display: "flex", alignItems: "center", gap: 14, width: "100%",
            padding: "13px 24px", background: "none", border: "none",
            borderBottom: "1px solid var(--line-2)", cursor: loading ? "not-allowed" : "pointer",
            textAlign: "left", opacity: loading && loading !== acc.email ? 0.45 : 1,
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--bg-2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          <Avatar name={acc.name} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{acc.name}</div>
            <div className="muted" style={{ fontSize: 12 }}>{acc.email}</div>
          </div>
          {loading === acc.email && <span className="spinner" />}
        </button>
      ))}

      {/* Usar outra conta */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          style={{
            display: "flex", alignItems: "center", gap: 14, width: "100%",
            padding: "13px 24px", background: "none", border: "none",
            borderBottom: "1px solid var(--line-2)", cursor: "pointer",
            color: "var(--ink-2)", fontSize: 14,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--line-2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="plus" size={15} />
          </div>
          Usar outra conta
        </button>
      ) : (
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10, borderBottom: "1px solid var(--line-2)" }}>
          <input
            className="input"
            placeholder="Seu nome completo"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            type="email"
            placeholder="seu@gmail.com"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
          />
          <button
            className="btn accent"
            disabled={!canSubmitCustom || !!loading}
            onClick={() => canSubmitCustom && onSelect({ name: customName.trim(), email: customEmail.trim() })}
          >
            {loading ? <><span className="spinner" /> Entrando…</> : "Continuar"}
          </button>
        </div>
      )}

      {onBack && (
        <div style={{ padding: "14px 24px" }}>
          <button className="btn ghost sm" onClick={onBack}>← Voltar</button>
        </div>
      )}
    </div>
  );
};

// ─── ContactModal ─────────────────────────────────────────────────────────────
// Se o usuário já está logado como cliente → mostra WhatsApp direto.
// Se não logado → picker Google inline → revela WhatsApp e cria sessão.

const ContactModal = ({ listing, onClose, onUnlock, session }) => {
  const alreadyClient = session?.role === "client";
  const [step, setStep] = React.useState(alreadyClient ? "reveal" : "prompt");
  const [clientName, setClientName] = React.useState(session?.name || "");
  const [loading, setLoading] = React.useState(null);

  React.useEffect(() => {
    if (alreadyClient) onUnlock?.({ name: session.name, email: session.email, role: "client" });
  }, []);

  const handleGoogleSelect = (account) => {
    setLoading(account.email);
    setTimeout(() => {
      setLoading(null);
      setClientName(account.name);
      onUnlock?.({ name: account.name, email: account.email, role: "client" });
      setStep("reveal");
    }, 900);
  };

  if (step === "prompt") {
    return (
      <ModalShell onClose={onClose}>
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid var(--line-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="mono" style={{ color: "var(--accent)" }}>● Entrar em contato</span>
            <button className="btn ghost icon sm" onClick={onClose}><Icon name="close" size={14} /></button>
          </div>
          <h2 style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.02em", marginTop: 10 }}>
            Falta pouco para falar<br />com {listing.landlord.name.split(" ")[0]}.
          </h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
            Entre com uma conta Google para liberar o WhatsApp do locador.
          </p>
        </div>
        <GooglePicker onSelect={handleGoogleSelect} loading={loading} />
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
// Fluxo unificado: seletor de perfil → Google → (locador: CPF + telefone)

const AuthModal = ({ onClose, onAuth, preRole = null }) => {
  const [step, setStep] = React.useState(preRole ? "google" : "role");
  const [role, setRole] = React.useState(preRole);
  const [googleUser, setGoogleUser] = React.useState(null);
  const [CPF, setCPF] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const handleRoleSelect = (r) => {
    setRole(r);
    setStep("google");
  };

  const handleGoogleSelect = (account) => {
    setLoading(account.email);
    setTimeout(() => {
      setLoading(null);
      setGoogleUser(account);

      if (role === "client") {
        onAuth({ name: account.name, email: account.email, role: "client" });
        onClose();
        return;
      }

      // Locador: verificar se já tem cadastro no mock data
      const pessoaExistente = window.DATA.PESSOAS?.find((p) => p.email === account.email);
      const locatarioExistente = pessoaExistente &&
        window.DATA.LOCATARIOS?.find((l) => l.idPessoa === pessoaExistente.idPessoa);

      if (locatarioExistente) {
        // Locador retornando — pula a etapa de complemento
        onAuth({ name: account.name, email: account.email, role: "landlord" });
        onClose();
      } else {
        setStep("complete");
      }
    }, 900);
  };

  const handleComplete = () => {
    const e = {};
    if (CPF.replace(/\D/g, "").length !== 11) e.CPF = "CPF inválido.";
    if (!validatePhone(phone)) e.phone = "Telefone com DDD obrigatório.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setTimeout(() => {
      onAuth({ name: googleUser.name, email: googleUser.email, role: "landlord", CPF, phone });
      onClose();
    }, 700);
  };

  return (
    <ModalShell onClose={onClose}>

      {/* Etapa 1: escolha de perfil */}
      {step === "role" && (
        <div style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span className="mono" style={{ color: "var(--accent)" }}>● AlugaAlegre</span>
            <button className="btn ghost icon sm" onClick={onClose}><Icon name="close" size={14} /></button>
          </div>
          <h2 style={{ fontSize: 24, letterSpacing: "-0.02em" }}>Bem-vindo ao AlugaAlegre</h2>
          <p className="muted" style={{ fontSize: 14, marginTop: 6, marginBottom: 24 }}>
            Como você quer usar a plataforma?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                r: "client",
                icon: "search",
                title: "Quero alugar um imóvel",
                sub: "Acesse contatos de locadores e salve favoritos",
              },
              {
                r: "landlord",
                icon: "home",
                title: "Tenho imóvel para alugar",
                sub: "Anuncie e gerencie seus imóveis no painel",
              },
            ].map(({ r, icon, title, sub }) => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "18px 20px",
                  border: "1.5px solid var(--line-2)", borderRadius: 12, background: "none",
                  cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-soft)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.background = "none"; }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "var(--accent-soft)", color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon name={icon} size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{sub}</div>
                </div>
                <Icon name="chevron" size={16} style={{ marginLeft: "auto", color: "var(--ink-3)" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Etapa 2: seletor de conta Google */}
      {step === "google" && (
        <>
          <div style={{ padding: "16px 20px 0" }}>
            <button
              className="btn ghost sm"
              onClick={() => preRole ? onClose() : setStep("role")}
            >
              ← Voltar
            </button>
          </div>
          <GooglePicker onSelect={handleGoogleSelect} loading={loading} />
        </>
      )}

      {/* Etapa 3: complemento de perfil (locador novo) */}
      {step === "complete" && (
        <div style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22,
                        padding: "12px 16px", background: "var(--bg-2)", borderRadius: 10 }}>
            <Avatar name={googleUser?.name} size={38} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{googleUser?.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{googleUser?.email}</div>
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
          <button
            className="btn accent lg"
            style={{ width: "100%", marginTop: 24 }}
            onClick={handleComplete}
            disabled={saving}
          >
            {saving
              ? <><span className="spinner" /> Criando conta…</>
              : <>Criar conta de locador <Icon name="arrow" size={14} /></>}
          </button>
          <button
            className="btn ghost sm"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => { setGoogleUser(null); setStep("google"); }}
          >
            ← Trocar conta Google
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

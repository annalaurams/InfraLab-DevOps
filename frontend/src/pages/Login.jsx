import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Adicione esta linha

const C = {
  primary:      "#C2622D",
  primaryHover: "#A8521F",
  primaryLight: "#D97B45",
  bg:           "#FAF5F0",
  surface:      "#FFFFFF",
  border:       "#E8D5C4",
  borderFocus:  "#C2622D",
  text:         "#3B1F0E",
  textMuted:    "#8B6555",
  accent:       "#F5EDE4",
  success:      "#4A7A5A",
  error:        "#B94040",
};

const FONT_BODY  = "'Source Sans 3', 'Segoe UI', Arial, sans-serif";
const FONT_TITLE = "'Merriweather', Georgia, serif";

function Input({ error, style: extStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? C.error : focused ? C.borderFocus : C.border;
  return (
    <input
      {...props}
      onFocus={(e) => { setFocused(true);  props.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); props.onBlur?.(e);  }}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "0.65rem 0.9rem", borderRadius: "8px",
        border: `1.5px solid ${borderColor}`,
        background: focused ? "#FFFAF7" : C.surface,
        color: C.text, fontSize: "0.95rem", outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
        boxShadow: focused ? `0 0 0 3px ${C.primary}22` : "none",
        fontFamily: FONT_BODY, ...extStyle,
      }}
    />
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" style={{ animation: "pf-spin 0.75s linear infinite", display: "block", flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-9-9" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginForm({ onNavigateToRegister }) {
  const navigate = useNavigate();
  const [form, setForm]           = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [status, setStatus]       = useState("idle");
  const [globalMsg, setGlobalMsg] = useState("");


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email?.trim())    errs.email    = "E-mail é obrigatório";
    if (!form.password?.trim()) errs.password = "Senha é obrigatória";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Informe um e-mail válido";
    return errs;
  };

  const handleSubmit = async () => {
    setGlobalMsg("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      if (res.ok) {
        let data = {};
        try { data = await res.json(); } catch { /* body vazio */ }

        const session = {
          user_id: data?.user_id,
          full_name: data?.full_name,
          email: data?.email || form.email.trim(),
          role: data?.role,
          logged_at: new Date().toISOString(),
        };

        localStorage.setItem("pf_session", JSON.stringify(session));
        setStatus("success");
        setTimeout(() => {
          navigate("/menu"); 
        }, 1500);
        return;
      }

      let data = {};
      try { data = await res.json(); } catch { /* body vazio */ }

      if (res.status === 401 || res.status === 403) {
        setGlobalMsg("E-mail ou senha incorretos. Verifique seus dados.");
      } else {
        setGlobalMsg(data?.detail || data?.message || `Erro ${res.status}. Tente novamente.`);
      }
      setStatus("error");

    } catch {
      setGlobalMsg("Não foi possível conectar ao servidor. Verifique sua conexão.");
      setStatus("error");
    }
  };

  const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body {
          margin: 0;
          background: ${C.bg};
          font-family: ${FONT_BODY};
          color: ${C.text};
          -webkit-font-smoothing: antialiased;
        }

        .pf-page {
          min-height: 100vh;
          background: ${C.bg};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        .pf-card {
          width: 100%;
          max-width: 440px;
          background: ${C.surface};
          border-radius: 16px;
          box-shadow: 0 2px 24px rgba(59,31,14,0.08), 0 1px 4px rgba(59,31,14,0.04);
          overflow: hidden;
        }

        .pf-card-stripe {
          height: 4px;
          background: linear-gradient(90deg, ${C.primary}, ${C.primaryLight}, #E8B87A);
        }

        .pf-card-body {
          padding: 2.25rem 2.25rem 2.5rem;
        }

        .pf-field {
          margin-bottom: 1rem;
        }

        .pf-field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: ${FONT_BODY};
          margin-bottom: 0.3rem;
        }

        .pf-field-error {
          font-size: 0.68rem;
          color: ${C.error};
          margin-top: 0.22rem;
          display: block;
          font-family: ${FONT_BODY};
        }

        .pf-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          width: 100%;
          height: 44px;
          border-radius: 8px;
          border: none;
          background: ${C.primary};
          color: #fff;
          font-family: ${FONT_BODY};
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
          box-shadow: 0 1px 4px ${C.primary}44, 0 3px 10px ${C.primary}28;
          letter-spacing: 0.01em;
          margin-top: 0.5rem;
        }
        .pf-btn-primary:hover:not(:disabled) {
          background: ${C.primaryHover};
          box-shadow: 0 2px 8px ${C.primary}55, 0 4px 16px ${C.primary}33;
        }
        .pf-btn-primary:active:not(:disabled) {
          transform: scale(0.98);
          box-shadow: 0 1px 3px ${C.primary}44;
        }
        .pf-btn-primary:disabled { opacity: 0.58; cursor: not-allowed; }

        .pf-alert {
          border-radius: 10px;
          padding: 0.875rem 1.1rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          animation: pf-slide-in 0.25s ease;
        }
        .pf-alert-success { background: #EDF7F0; border: 1.5px solid ${C.success}55; }
        .pf-alert-error   { background: #FDF0F0; border: 1.5px solid ${C.error}55; }

        .pf-divider-text {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.5rem 0 0;
          color: ${C.textMuted};
          font-size: 0.78rem;
          font-family: ${FONT_BODY};
        }
        .pf-divider-text::before,
        .pf-divider-text::after {
          content: "";
          flex: 1;
          height: 1px;
          background: ${C.border};
        }

        .pf-register-link {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.85rem;
          color: ${C.textMuted};
          font-family: ${FONT_BODY};
        }
        .pf-register-link a, .pf-register-link button.pf-link {
          color: ${C.primary};
          font-weight: 700;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-family: ${FONT_BODY};
          font-size: inherit;
          padding: 0;
        }
        .pf-register-link a:hover, .pf-register-link button.pf-link:hover {
          text-decoration: underline;
        }

        .pf-forgot {
          display: block;
          text-align: right;
          margin-top: 0.35rem;
          font-size: 0.75rem;
          color: ${C.textMuted};
          font-family: ${FONT_BODY};
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: color 0.15s;
        }
        .pf-forgot:hover { color: ${C.primary}; text-decoration: underline; }

        @media (max-width: 480px) {
          .pf-card-body { padding: 1.75rem 1.25rem 2rem; }
          .pf-page { padding: 1.5rem 1rem; justify-content: flex-start; padding-top: 3rem; }
        }

        @keyframes pf-spin     { to { transform: rotate(360deg); } }
        @keyframes pf-slide-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="pf-page">
        <main className="pf-card">
          <div className="pf-card-stripe" />
          <div className="pf-card-body">

            {/* Logo + Título */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "14px",
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
                boxShadow: `0 4px 14px ${C.primary}33`,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>

              <div style={{
                fontFamily: FONT_TITLE, fontWeight: 900, fontSize: "1.3rem",
                color: C.text, lineHeight: 1.1, marginBottom: "0.2rem",
              }}>
                People<span style={{ color: C.primary }}>Flow</span>
              </div>
              <div style={{
                fontSize: "0.62rem", color: C.textMuted,
                letterSpacing: "0.1em", textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}>
                Gestão de Pessoas
              </div>

              <h1 style={{
                fontFamily: FONT_TITLE, fontSize: "1.35rem", fontWeight: 900,
                color: C.text, margin: "0 0 0.3rem", lineHeight: 1.2,
              }}>
                Bem-vindo(a) de volta
              </h1>
              <p style={{ margin: 0, color: C.textMuted, fontSize: "0.875rem", fontFamily: FONT_BODY }}>
                Entre para acessar o sistema
              </p>
            </div>

            {/* ── Alertas ── */}
            {status === "success" && (
              <div className="pf-alert pf-alert-success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.success}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: "1px" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div>
                  <div style={{ fontWeight: 700, color: C.success, fontSize: "0.875rem" }}>
                    Login realizado com sucesso!
                  </div>
                  <div style={{ fontSize: "0.78rem", color: C.success, marginTop: "0.1rem", opacity: 0.85 }}>
                    Redirecionando...
                  </div>
                </div>
              </div>
            )}

            {status === "error" && globalMsg && (
              <div className="pf-alert pf-alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.error}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: "1px" }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div style={{ fontWeight: 700, color: C.error, fontSize: "0.875rem" }}>
                  {globalMsg}
                </div>
              </div>
            )}

            {/* ── Campo E-mail ── */}
            <div className="pf-field">
              <label className="pf-field-label" style={{ color: errors.email ? C.error : C.textMuted }}>
                E-mail
              </label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                error={errors.email}
                placeholder="usuario@empresa.com.br"
                autoComplete="email"
              />
              {errors.email && <span className="pf-field-error">{errors.email}</span>}
            </div>

            {/* ── Campo Senha ── */}
            <div className="pf-field">
              <label className="pf-field-label" style={{ color: errors.password ? C.error : C.textMuted }}>
                Senha
              </label>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                error={errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <span className="pf-field-error">{errors.password}</span>}
              <button className="pf-forgot" type="button">
                Esqueci minha senha
              </button>
            </div>

            {/* ── Botão Entrar ── */}
            <button
              type="button"
              className="pf-btn-primary"
              onClick={handleSubmit}
              disabled={status === "sending"}
            >
              {status === "sending" ? (
                <><Spinner /> Entrando...</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Entrar
                </>
              )}
            </button>

          </div>
        </main>
      </div>
    </>
  );
}
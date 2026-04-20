import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  primary: "#C2622D",
  primaryHover: "#A8521F",
  primaryLight: "#D97B45",
  bg: "#FAF5F0",
  surface: "#FFFFFF",
  border: "#E8D5C4",
  text: "#3B1F0E",
  textMuted: "#8B6555",
  accent: "#F5EDE4",
  error: "#B94040",
};

const FONT_BODY = "'Source Sans 3', 'Segoe UI', Arial, sans-serif";
const FONT_TITLE = "'Merriweather', Georgia, serif";

const ROLE_LABELS = {
  admin: "Administrador",
  assistente: "Assistente",
  funcionario: "Funcionário",
};

const ALL_ITEMS = [
  {
    key: "criar",
    route: "/register",
    label: "Criar usuário",
    description: "Cadastrar um novo colaborador no sistema",
    roles: ["admin"],
    icon: (color) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    key: "listar",
    route: "/list-user",
    label: "Listar usuários",
    description: "Visualizar todos os colaboradores cadastrados",
    roles: ["admin", "assistente"],
    icon: (color) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    key: "editar",
    route: "/edit-user",
    label: "Editar usuário",
    description: "Atualizar dados de um colaborador existente",
    roles: ["admin", "assistente", "funcionario"],
    icon: (color) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    key: "deletar",
    route: "/delete-user",
    label: "Deletar usuário",
    description: "Remover permanentemente um colaborador do sistema",
    roles: ["admin"],
    danger: true,
    icon: (color) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    ),
  },
];

function getSession() {
  try {
    const raw = localStorage.getItem("pf_session") || sessionStorage.getItem("pf_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("pf_session");
  sessionStorage.removeItem("pf_session");
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserMenu() {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);
  const [ownRecord, setOwnRecord] = useState(null);
  const [showOwnInfo, setShowOwnInfo] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session?.user_id && !session?.email) {
      setAuthState("unauth");
      return;
    }

    setUser({
      user_id: session?.user_id,
      full_name: session?.full_name || session?.email || "Usuário",
      email: session?.email,
      role: session?.role || "funcionario",
    });
    setAuthState("ok");
  }, []);

  useEffect(() => {
    if (authState === "unauth") navigate("/login", { replace: true });
  }, [authState, navigate]);

  useEffect(() => {
    if (authState !== "ok" || !user?.email) return;

    fetch("/users/")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const own = list.find((u) => u.email === user.email || u.id === user.user_id);
        setOwnRecord(own || user);
      })
      .catch(() => {
        setOwnRecord(user);
      });
  }, [authState, user?.email, user?.user_id]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const visibleItems = ALL_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role));

  if (authState === "checking") {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; background: ${C.bg}; font-family: ${FONT_BODY}; }
          .pf-splash { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
          .pf-spinner { width: 26px; height: 26px; border: 2.5px solid ${C.border}; border-top-color: ${C.primary}; border-radius: 50%; animation: pf-spin 0.7s linear infinite; }
          @keyframes pf-spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="pf-splash">
          <div style={{
            width: 48, height: 48, borderRadius: "12px",
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px ${C.primary}33`,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="pf-spinner" />
          <span style={{ fontSize: "0.8rem", color: C.textMuted, fontFamily: FONT_BODY }}>
            Verificando sessão...
          </span>
        </div>
      </>
    );
  }

  if (authState === "unauth") return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; font-family: ${FONT_BODY}; color: ${C.text}; -webkit-font-smoothing: antialiased; }

        .pf-page {
          min-height: 100vh; background: ${C.bg};
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 2.5rem 1.5rem 4rem;
        }

        .pf-header {
          width: 100%; max-width: 760px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .pf-card {
          width: 100%; max-width: 760px;
          background: ${C.surface}; border-radius: 16px;
          box-shadow: 0 2px 24px rgba(59,31,14,0.08), 0 1px 4px rgba(59,31,14,0.04);
          overflow: hidden;
        }

        .pf-card-stripe {
          height: 4px;
          background: linear-gradient(90deg, ${C.primary}, ${C.primaryLight}, #E8B87A);
        }

        .pf-card-body { padding: 2rem 2.25rem 2.25rem; }

        .pf-user-card {
          display: flex; align-items: center; gap: 0.85rem;
          width: 100%;
          background: ${C.accent}; border-radius: 10px;
          border: 1px solid ${C.border};
          padding: 0.85rem 1rem; margin-bottom: 1rem;
          text-align: left;
          cursor: pointer;
        }
        .pf-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: ${C.primary}1A; color: ${C.primary};
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.9rem;
          font-family: ${FONT_BODY}; flex-shrink: 0;
        }
        .pf-user-name-text {
          font-weight: 700; font-size: 0.9rem; color: ${C.text};
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-family: ${FONT_BODY};
        }
        .pf-role-badge {
          display: inline-block;
          font-size: 0.62rem; font-weight: 700;
          color: ${C.primary}; background: ${C.surface};
          border: 1px solid ${C.border}; border-radius: 20px;
          padding: 0.1rem 0.5rem; margin-top: 0.15rem;
          letter-spacing: 0.04em; text-transform: uppercase;
          font-family: ${FONT_BODY};
        }

        .pf-section-label {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; color: ${C.textMuted};
          font-family: ${FONT_BODY}; margin: 0 0 0.55rem 0.1rem;
        }

        .pf-subcard {
          border: 1px solid ${C.border};
          border-radius: 12px;
          padding: 0.9rem 1rem;
          background: ${C.surface};
        }

        .pf-menu-item {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 0.95rem 1rem; border-radius: 12px;
          border: 1.5px solid ${C.border}; background: ${C.surface};
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.1s;
          text-align: left; width: 100%;
          font-family: ${FONT_BODY}; margin-bottom: 0.55rem;
        }
        .pf-menu-item:last-of-type { margin-bottom: 0; }
        .pf-menu-item:hover {
          border-color: ${C.primary}77; background: ${C.accent};
          box-shadow: 0 2px 10px ${C.primary}10;
        }
        .pf-menu-item:active { transform: scale(0.99); }
        .pf-menu-item.danger:hover { border-color: #B9404077; background: #FDF0F0; }

        .pf-icon-wrap {
          width: 40px; height: 40px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: ${C.accent}; transition: background 0.18s;
        }
        .pf-menu-item:hover .pf-icon-wrap     { background: ${C.primary}18; }
        .pf-menu-item.danger .pf-icon-wrap    { background: #FDF0F0; }
        .pf-menu-item.danger:hover .pf-icon-wrap { background: #B9404015; }

        .pf-item-info  { flex: 1; min-width: 0; }
        .pf-item-label { font-weight: 700; font-size: 0.88rem; color: ${C.text}; font-family: ${FONT_BODY}; margin-bottom: 0.1rem; }
        .pf-item-label.danger { color: #B94040; }
        .pf-item-desc  { font-size: 0.76rem; color: ${C.textMuted}; font-family: ${FONT_BODY}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pf-item-desc.danger { color: #B9404088; }

        .pf-chevron { flex-shrink: 0; color: ${C.border}; transition: color 0.18s, transform 0.18s; }
        .pf-menu-item:hover .pf-chevron       { color: ${C.primary}; transform: translateX(3px); }
        .pf-menu-item.danger:hover .pf-chevron { color: #B94040; }

        .pf-logout-wrap { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid ${C.border}; }
        .pf-logout-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 0.45rem; width: 100%; height: 40px; border-radius: 8px;
          border: 1.5px solid ${C.border}; background: transparent;
          color: ${C.textMuted}; font-family: ${FONT_BODY};
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
        }
        .pf-logout-btn:hover { border-color: #B9404077; color: #B94040; background: #FDF0F0; }
        .pf-logout-btn:active { transform: scale(0.99); }

        .pf-overlay {
          position: fixed; inset: 0; background: rgba(59,31,14,0.28);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem; z-index: 100; animation: pf-fade 0.15s ease;
        }
        .pf-confirm-box {
          background: ${C.surface}; border-radius: 14px;
          max-width: 360px; width: 100%;
          box-shadow: 0 8px 40px rgba(59,31,14,0.18);
          overflow: hidden; animation: pf-pop 0.18s ease;
        }
        .pf-confirm-stripe { height: 4px; background: #B94040; }
        .pf-confirm-body { padding: 1.5rem 1.5rem 1.25rem; }
        .pf-confirm-title {
          font-family: ${FONT_TITLE}; font-weight: 900; font-size: 1.05rem;
          color: ${C.text}; margin: 0 0 0.4rem;
        }
        .pf-confirm-desc { font-size: 0.85rem; color: ${C.textMuted}; font-family: ${FONT_BODY}; margin: 0 0 1.25rem; }
        .pf-confirm-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }
        .pf-btn-cancel {
          padding: 0 1.1rem; height: 38px; border-radius: 8px;
          border: 1.5px solid ${C.border}; background: transparent;
          color: ${C.textMuted}; font-family: ${FONT_BODY};
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .pf-btn-cancel:hover { border-color: ${C.primary}88; color: ${C.primary}; }
        .pf-btn-confirm-logout {
          padding: 0 1.25rem; height: 38px; border-radius: 8px;
          border: none; background: #B94040; color: #fff;
          font-family: ${FONT_BODY}; font-size: 0.875rem; font-weight: 700;
          cursor: pointer; transition: background 0.15s;
          box-shadow: 0 2px 8px #B9404033;
        }
        .pf-btn-confirm-logout:hover { background: #9A3030; }

        @media (max-width: 520px) {
          .pf-card-body { padding: 1.5rem 1.25rem 1.75rem; }
          .pf-page { padding: 1.5rem 1rem 3rem; justify-content: flex-start; padding-top: 2.5rem; }
        }

        @keyframes pf-fade    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pf-pop     { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pf-item-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="pf-page">
        <header className="pf-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "8px",
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: FONT_TITLE, fontWeight: 900, fontSize: "1rem", color: C.text, lineHeight: 1.1 }}>
                People<span style={{ color: C.primary }}>Flow</span>
              </div>
              <div style={{ fontSize: "0.6rem", color: C.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>
                Gestão de Pessoas
              </div>
            </div>
          </div>
          <div style={{
            fontSize: "0.72rem", color: C.textMuted, background: C.accent,
            padding: "0.28rem 0.75rem", borderRadius: "20px",
            border: `1px solid ${C.border}`, fontFamily: FONT_BODY,
          }}>
            Painel
          </div>
        </header>

        <main className="pf-card">
          <div className="pf-card-stripe" />
          <div className="pf-card-body">
            <div style={{ marginBottom: "1.25rem" }}>
              <h1 style={{
                fontFamily: FONT_TITLE, fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
                fontWeight: 900, color: C.text, margin: "0 0 0.25rem", lineHeight: 1.2,
              }}>
                Menu principal
              </h1>
              <p style={{ margin: 0, color: C.textMuted, fontSize: "0.82rem", fontFamily: FONT_BODY }}>
                Selecione uma ação para continuar
              </p>
            </div>

            {user && (
              <>
                <button type="button" className="pf-user-card" onClick={() => setShowOwnInfo((v) => !v)}>
                  <div className="pf-avatar">{initials(user.full_name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pf-user-name-text">{user.full_name}</div>
                    <span className="pf-role-badge">
                      {ROLE_LABELS[user.role] || user.role || "Usuário"}
                    </span>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={C.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showOwnInfo ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {showOwnInfo && (
                  <div className="pf-subcard" style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", color: C.textMuted, marginBottom: "1rem" }}>
                    <div><strong style={{ color: C.text }}>Nome:</strong> {ownRecord?.full_name || "-"}</div>
                    <div><strong style={{ color: C.text }}>E-mail:</strong> {ownRecord?.email || "-"}</div>
                    <div><strong style={{ color: C.text }}>CPF:</strong> {ownRecord?.cpf || "-"}</div>
                    <div><strong style={{ color: C.text }}>Cargo:</strong> {ownRecord?.job_title || "-"}</div>
                    <div><strong style={{ color: C.text }}>Cidade:</strong> {ownRecord?.city || "-"}</div>
                    <div><strong style={{ color: C.text }}>Estado:</strong> {ownRecord?.state || "-"}</div>
                  </div>
                )}
              </>
            )}

            {visibleItems.length > 0 ? (
              <>
                <p className="pf-section-label">Ações disponíveis</p>
                {visibleItems.map((item, i) => (
                  <button
                    key={item.key}
                    className={`pf-menu-item${item.danger ? " danger" : ""}`}
                    style={{ animation: `pf-item-in 0.22s ease ${i * 55}ms both` }}
                    type="button"
                    onClick={() => item.route && navigate(item.route)}
                  >
                    <div className="pf-icon-wrap">
                      {item.icon(item.danger ? "#B94040" : C.primary)}
                    </div>
                    <div className="pf-item-info">
                      <div className={`pf-item-label${item.danger ? " danger" : ""}`}>
                        {item.label}
                      </div>
                      <div className={`pf-item-desc${item.danger ? " danger" : ""}`}>
                        {item.description}
                      </div>
                    </div>
                    <svg className="pf-chevron" width="15" height="15" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </>
            ) : (
              <div style={{
                textAlign: "center", padding: "2rem 1rem",
                color: C.textMuted, fontSize: "0.875rem", fontFamily: FONT_BODY,
              }}>
                Nenhuma ação disponível para seu perfil.
              </div>
            )}

            <div className="pf-logout-wrap">
              <button type="button" className="pf-logout-btn" onClick={() => setLogoutConfirm(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sair da conta
              </button>
            </div>
          </div>
        </main>
      </div>

      {logoutConfirm && (
        <div className="pf-overlay" onClick={() => setLogoutConfirm(false)}>
          <div className="pf-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="pf-confirm-stripe" />
            <div className="pf-confirm-body">
              <h2 className="pf-confirm-title">Sair da conta?</h2>
              <p className="pf-confirm-desc">
                Você será redirecionado para o login e precisará entrar novamente.
              </p>
              <div className="pf-confirm-actions">
                <button className="pf-btn-cancel" type="button" onClick={() => setLogoutConfirm(false)}>
                  Cancelar
                </button>
                <button className="pf-btn-confirm-logout" type="button" onClick={handleLogout}>
                  Confirmar saída
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

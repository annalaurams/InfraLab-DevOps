import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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

const ROLE_LABELS = {
  admin:       "Administrador",
  assistente:  "Assistente",
  funcionario: "Funcionário",
};

const GENDER_LABELS = {
  masculino:            "Masculino",
  feminino:             "Feminino",
  nao_binario:          "Não-binário",
  prefiro_nao_informar: "Prefiro não informar",
};

const EDUCATION_LABELS = {
  ensino_medio:  "Ensino Médio",
  tecnico:       "Técnico",
  graduacao:     "Graduação",
  pos_graduacao: "Pós-Graduação / MBA",
  mestrado:      "Mestrado",
  doutorado:     "Doutorado",
};

function formatCpf(raw) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  if (d.length !== 11) return raw;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatDate(raw) {
  if (!raw) return null;
  try { const [y,m,d] = raw.split("-"); return `${d}/${m}/${y}`; }
  catch { return raw; }
}

function formatZip(raw) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  return d.length === 8 ? `${d.slice(0,5)}-${d.slice(5)}` : raw;
}

function buildAddress(u) {
  const parts = [
    u.street,
    u.house_number ? `nº ${u.house_number}` : null,
    u.complement,
    u.neighborhood,
    u.city,
    u.state,
    formatZip(u.zip_code) ? `CEP ${formatZip(u.zip_code)}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1
    ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTES = [
  { bg: "#F5EDE4", fg: "#C2622D" },
  { bg: "#E8F4ED", fg: "#3A7A56" },
  { bg: "#E8EEF8", fg: "#3A5EA8" },
  { bg: "#F4E8F4", fg: "#8A3A8A" },
  { bg: "#F8F0E4", fg: "#A87A28" },
];

function avatarPalette(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h += name.charCodeAt(i);
  return AVATAR_PALETTES[h % AVATAR_PALETTES.length];
}

function DetailItem({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.18rem" }}>
      <span style={{
        fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.06em",
        textTransform: "uppercase", color: C.textMuted, fontFamily: FONT_BODY,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "0.875rem", color: C.text,
        fontFamily: FONT_BODY, wordBreak: "break-word",
      }}>
        {value}
      </span>
    </div>
  );
}

function UserCard({ user, index }) {
  const [open, setOpen]       = useState(false);
  const [hovered, setHovered] = useState(false);
  const { bg, fg }            = avatarPalette(user.full_name);
  const address               = buildAddress(user);

  return (
    <div style={{
      borderRadius: "10px",
      border: `1.5px solid ${open ? C.primary + "88" : C.border}`,
      background: C.surface,
      overflow: "hidden",
      transition: "border-color 0.18s, box-shadow 0.18s",
      boxShadow: open
        ? `0 2px 16px rgba(194,98,45,0.09), 0 1px 4px rgba(194,98,45,0.05)`
        : "none",
      animation: `pf-item-in 0.22s ease ${Math.min(index, 14) * 38}ms both`,
    }}>

      {/* ── Linha clicável ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", gap: "0.85rem",
          width: "100%", padding: "0.875rem 1rem",
          background: hovered ? C.accent + "99" : "transparent",
          border: "none", cursor: "pointer", textAlign: "left",
          fontFamily: FONT_BODY, transition: "background 0.15s",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: bg, color: fg, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.82rem", fontWeight: 700, fontFamily: FONT_BODY,
          letterSpacing: "0.02em",
        }}>
          {initials(user.full_name)}
        </div>

        {/* Nome + cargo + CPF */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: "0.9rem", color: C.text,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            fontFamily: FONT_BODY,
          }}>
            {user.full_name}
          </div>
          <div style={{
            display: "flex", alignItems: "center", flexWrap: "wrap",
            gap: "0.35rem", marginTop: "0.12rem",
          }}>
            {user.job_title && (
              <span style={{
                fontSize: "0.775rem", color: C.textMuted, fontFamily: FONT_BODY,
                maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user.job_title}
              </span>
            )}
            {user.job_title && user.cpf && (
              <span style={{ fontSize: "0.6rem", color: C.border }}>·</span>
            )}
            {user.cpf && (
              <span style={{ fontSize: "0.775rem", color: C.textMuted, fontFamily: FONT_BODY }}>
                {formatCpf(user.cpf)}
              </span>
            )}
          </div>
        </div>

        {/* Badge de perfil */}
        {user.role && (
          <span style={{
            fontSize: "0.6rem", fontWeight: 700,
            color: C.primary, background: C.accent,
            border: `1px solid ${C.border}`, borderRadius: "20px",
            padding: "0.12rem 0.55rem", whiteSpace: "nowrap",
            letterSpacing: "0.04em", textTransform: "uppercase",
            fontFamily: FONT_BODY, flexShrink: 0,
          }}>
            {ROLE_LABELS[user.role] || user.role}
          </span>
        )}

        {/* Chevron */}
        <svg
          width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke={C.textMuted} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.22s ease",
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* ── Painel de detalhes ── */}
      {open && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "1rem 1rem 1.1rem",
          animation: "pf-detail-in 0.18s ease",
        }}>

          {/* Endereço */}
          {address && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "0.5rem",
              background: C.accent, borderRadius: "8px",
              padding: "0.65rem 0.85rem", marginBottom: "1rem",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: "1px" }}>
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontSize: "0.84rem", color: C.text, fontFamily: FONT_BODY, lineHeight: 1.45 }}>
                {address}
              </span>
            </div>
          )}

          {/* Grid de detalhes */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "0.8rem 1.25rem",
          }}>
            <DetailItem label="E-mail"             value={user.email} />
            <DetailItem label="CPF"                value={formatCpf(user.cpf)} />
            <DetailItem label="Data de nascimento" value={formatDate(user.birth_date)} />
            <DetailItem label="Gênero"             value={GENDER_LABELS[user.gender] || user.gender} />
            <DetailItem label="Cargo"              value={user.job_title} />
            <DetailItem label="Perfil de acesso"   value={ROLE_LABELS[user.role] || user.role} />
            <DetailItem label="Formação"           value={EDUCATION_LABELS[user.education] || user.education} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserList() {
  const navigate = useNavigate();

  const [allUsers,   setAllUsers]   = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [query,      setQuery]      = useState("");
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const token = (() => {
          try {
            const raw = localStorage.getItem("pf_session") || sessionStorage.getItem("pf_session");
            return raw ? JSON.parse(raw).token : null;
          } catch { return null; }
        })();

        const res = await fetch("/users/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401) { navigate("/login", { replace: true }); return; }
        if (!res.ok) throw new Error(`Erro ${res.status}`);

        const data = await res.json();
        const sorted = [...data].sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || "", "pt-BR")
        );
        setAllUsers(sorted);
        setFiltered(sorted);
      } catch {
        setFetchError("Não foi possível carregar os usuários. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q    = val.trim().toLowerCase();
      const cpfQ = q.replace(/\D/g, "");
      if (!q) { setFiltered(allUsers); return; }
      setFiltered(
        allUsers.filter(u =>
          (u.full_name || "").toLowerCase().includes(q) ||
          (cpfQ && (u.cpf || "").replace(/\D/g, "").includes(cpfQ))
        )
      );
    }, 220);
  };

  const clearSearch = () => { setQuery(""); setFiltered(allUsers); };

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
          padding: 2.5rem 1.5rem 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pf-header {
          width: 100%;
          max-width: 980px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── Card ── */
        .pf-card {
          width: 100%;
          max-width: 980px;
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
          padding: 2rem 2.25rem 2.5rem;
        }

        /* ── Busca ── */
        .pf-search-wrap {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .pf-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: ${C.textMuted};
          display: flex;
          align-items: center;
        }

        .pf-search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.6rem 2.5rem 0.6rem 2.4rem;
          border-radius: 8px;
          border: 1.5px solid ${C.border};
          background: ${C.surface};
          color: ${C.text};
          font-size: 0.875rem;
          font-family: ${FONT_BODY};
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .pf-search-input:focus {
          border-color: ${C.borderFocus};
          box-shadow: 0 0 0 3px ${C.primary}22;
          background: #FFFAF7;
        }

        .pf-search-input::placeholder { color: ${C.textMuted}; }

        .pf-search-clear {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: ${C.textMuted};
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .pf-search-clear:hover { color: ${C.primary}; }

        /* ── Estados ── */
        .pf-count {
          font-size: 0.74rem;
          color: ${C.textMuted};
          font-family: ${FONT_BODY};
          margin-bottom: 0.75rem;
          padding-left: 0.1rem;
        }

        .pf-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .pf-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 3.5rem 1rem;
          color: ${C.textMuted};
          font-size: 0.875rem;
          font-family: ${FONT_BODY};
        }

        .pf-spinner {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          border: 2px solid ${C.border};
          border-top-color: ${C.primary};
          border-radius: 50%;
          animation: pf-spin 0.7s linear infinite;
        }

        .pf-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: ${C.textMuted};
          font-size: 0.875rem;
          font-family: ${FONT_BODY};
        }

        /* ── Erro ── */
        .pf-error-box {
          border-radius: 10px;
          padding: 0.875rem 1.1rem;
          background: #FDF0F0;
          border: 1.5px solid ${C.error}55;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.875rem;
          color: ${C.error};
          font-family: ${FONT_BODY};
        }

        /* ── Botão voltar ── */
        .pf-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0 1.25rem;
          height: 40px;
          border-radius: 8px;
          border: 1.5px solid ${C.border};
          background: transparent;
          color: ${C.textMuted};
          font-family: ${FONT_BODY};
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
          white-space: nowrap;
        }
        .pf-btn-secondary:hover {
          border-color: ${C.primary}88;
          color: ${C.primary};
          background: ${C.accent};
        }
        .pf-btn-secondary:active { transform: scale(0.98); }

        /* ── Divider ── */
        .pf-divider {
          border: none;
          border-top: 1px solid ${C.border};
          margin: 1.5rem 0;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .pf-card-body { padding: 1.5rem 1.25rem 2rem; }
          .pf-page { padding: 1.5rem 1rem 3rem; }
        }

        @keyframes pf-spin      { to { transform: rotate(360deg); } }
        @keyframes pf-item-in   { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pf-detail-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="pf-page">

        {}
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
              <div style={{
                fontFamily: FONT_TITLE, fontWeight: 900, fontSize: "1rem",
                color: C.text, lineHeight: 1.1,
              }}>
                People<span style={{ color: C.primary }}>Flow</span>
              </div>
              <div style={{
                fontSize: "0.6rem", color: C.textMuted,
                letterSpacing: "0.09em", textTransform: "uppercase",
              }}>
                Gestão de Pessoas
              </div>
            </div>
          </div>

          <button
            type="button"
            className="pf-btn-secondary"
            onClick={() => navigate("/menu")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Voltar
          </button>
        </header>

        {/* ── Card ── */}
        <main className="pf-card">
          <div className="pf-card-stripe" />
          <div className="pf-card-body">

            {/* Título */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h1 style={{
                fontFamily: FONT_TITLE,
                fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)",
                fontWeight: 900, color: C.text,
                margin: "0 0 0.3rem", lineHeight: 1.2,
              }}>
                Usuários
              </h1>
              <p style={{
                margin: 0, color: C.textMuted,
                fontSize: "0.85rem", fontFamily: FONT_BODY,
              }}>
                Clique em um usuário para ver todos os detalhes.
              </p>
            </div>

            <hr className="pf-divider" style={{ marginTop: 0 }} />

            {/* ── Busca ── */}
            <div className="pf-search-wrap">
              <span className="pf-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="pf-search-input"
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={query}
                onChange={handleSearch}
                autoComplete="off"
              />
              {query && (
                <button className="pf-search-clear" type="button" onClick={clearSearch} aria-label="Limpar busca">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* ── Conteúdo ── */}
            {loading ? (
              <div className="pf-loading">
                <div className="pf-spinner" />
                Carregando usuários...
              </div>
            ) : fetchError ? (
              <div className="pf-error-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: "1px" }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {fetchError}
              </div>
            ) : (
              <>
                <div className="pf-count">
                  {filtered.length === 0
                    ? "Nenhum resultado"
                    : filtered.length === 1
                    ? "1 usuário"
                    : `${filtered.length} usuários`}
                  {query && allUsers.length !== filtered.length && (
                    <span style={{ color: C.border }}> · {allUsers.length} no total</span>
                  )}
                </div>

                {filtered.length === 0 ? (
                  <div className="pf-empty">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
                      stroke={C.border} strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ display: "block", margin: "0 auto 0.75rem" }}>
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Nenhum usuário encontrado para <strong>"{query}"</strong>
                  </div>
                ) : (
                  <div className="pf-list">
                    {filtered.map((user, i) => (
                      <UserCard key={user.id ?? user.email ?? i} user={user} index={i} />
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
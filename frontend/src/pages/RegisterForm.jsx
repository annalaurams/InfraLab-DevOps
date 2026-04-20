import { useState } from "react";
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

const masks = {
  cpf: (v) =>
    v.replace(/\D/g, "")
     .slice(0, 11)
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d)/, "$1.$2")
     .replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  zip_code: (v) =>
    v.replace(/\D/g, "")
     .slice(0, 8)
     .replace(/(\d{5})(\d)/, "$1-$2"),
};

const isValidCpf = (value) => {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (base, factor) => {
    const total = base.split("").reduce((sum, digit, index) => sum + Number(digit) * (factor - index), 0);
    const digit = (total * 10) % 11;
    return digit === 10 ? 0 : digit;
  };

  const first = calcDigit(cpf.slice(0, 9), 10);
  const second = calcDigit(cpf.slice(0, 10), 11);
  return cpf.endsWith(`${first}${second}`);
};

const INITIAL_FORM = {
  full_name: "", email: "", password: "", role: "",
  cpf: "", birth_date: "", gender: "",
  zip_code: "", street: "", neighborhood: "", city: "",
  state: "", house_number: "", complement: "",
  education: "", job_title: "",
};

const REQUIRED = ["full_name", "email", "password", "role"];

const FIELD_LABELS = {
  full_name: "Nome completo", email: "E-mail", password: "Senha",
  role: "Perfil de acesso", cpf: "CPF", birth_date: "Data de nascimento",
  gender: "Gênero", zip_code: "CEP", street: "Logradouro",
  neighborhood: "Bairro", city: "Cidade", state: "Estado",
  house_number: "Número", complement: "Complemento",
  education: "Formação acadêmica", job_title: "Cargo",
};

function parseApiErrors(status, data) {
  const fieldErrors = {};
  let globalMessage = "";
  if (status === 422 && Array.isArray(data?.detail)) {
    data.detail.forEach(({ loc, msg }) => {
      const field = loc?.[loc.length - 1];
      if (field && field in FIELD_LABELS) fieldErrors[field] = `${FIELD_LABELS[field]}: ${msg}`;
      else globalMessage = globalMessage ? `${globalMessage} | ${msg}` : msg;
    });
    if (!globalMessage && Object.keys(fieldErrors).length === 0)
      globalMessage = "Dados inválidos. Verifique os campos e tente novamente.";
  } else if (status === 400) {
    const detail = typeof data?.detail === "string" ? data.detail : "";
    if (/e-?mail/i.test(detail)) fieldErrors.email = detail;
    else if (/cpf/i.test(detail)) fieldErrors.cpf = detail;
    else globalMessage = detail || "Requisição inválida.";
  } else {
    globalMessage = data?.detail || data?.message || `Erro ${status}. Tente novamente.`;
  }
  return { fieldErrors, globalMessage };
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h2 style={{
        fontFamily: FONT_TITLE, fontSize: "0.95rem", fontWeight: 700,
        color: C.text, margin: "0 0 0.2rem", letterSpacing: "-0.01em",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ margin: 0, fontSize: "0.78rem", color: C.textMuted, fontFamily: FONT_BODY }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Field({ label, error, children, half, third, twoThird }) {
  const flex =
    third    ? "0 0 calc(33.33% - 0.5rem)" :
    half     ? "0 0 calc(50% - 0.5rem)"    :
    twoThird ? "0 0 calc(66.66% - 0.5rem)" :
               "0 0 100%";
  return (
    <div style={{ flex, minWidth: 0 }}>
      <label style={{
        display: "block", fontSize: "0.7rem", fontWeight: 700,
        color: error ? C.error : C.textMuted, marginBottom: "0.28rem",
        letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: FONT_BODY,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{
          fontSize: "0.68rem", color: C.error, marginTop: "0.22rem",
          display: "block", fontFamily: FONT_BODY,
        }}>
          {error}
        </span>
      )}
    </div>
  );
}

function Input({ error, style: extStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? C.error : focused ? C.borderFocus : C.border;
  return (
    <input
      {...props}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "0.6rem 0.8rem", borderRadius: "8px",
        border: `1.5px solid ${borderColor}`,
        background: focused ? "#FFFAF7" : C.surface,
        color: C.text, fontSize: "0.875rem", outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
        boxShadow: focused ? `0 0 0 3px ${C.primary}22` : "none",
        fontFamily: FONT_BODY, ...extStyle,
      }}
    />
  );
}

function Select({ error, children, style: extStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? C.error : focused ? C.borderFocus : C.border;
  return (
    <select
      {...props}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "0.6rem 0.8rem", borderRadius: "8px",
        border: `1.5px solid ${borderColor}`,
        background: focused ? "#FFFAF7" : C.surface,
        color: props.value ? C.text : C.textMuted,
        fontSize: "0.875rem", outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: focused ? `0 0 0 3px ${C.primary}22` : "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238B6555' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 0.8rem center",
        paddingRight: "2rem", cursor: "pointer", fontFamily: FONT_BODY, ...extStyle,
      }}
    >
      {children}
    </select>
  );
}

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" style={{ animation: "pf-spin 0.75s linear infinite", display: "block", flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-9-9" strokeLinecap="round" />
    </svg>
  );
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm]           = useState(INITIAL_FORM);
  const [errors, setErrors]       = useState({});
  const [status, setStatus]       = useState("idle");
  const [globalMsg, setGlobalMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "cpf")      val = masks.cpf(value);
    if (name === "zip_code") val = masks.zip_code(value);
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "zip_code") {
      const cepDigits = val.replace(/\D/g, "");
      if (cepDigits.length === 8) {
        void handleCepLookup(cepDigits);
      }
    }
  };

  const handleCepLookup = async (cep) => {
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`/address/cep/${cep}`);
      if (!res.ok) return;
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        street:       data.logradouro || prev.street,
        neighborhood: data.bairro     || prev.neighborhood,
        city:         data.localidade || prev.city,
        state:        data.uf         || prev.state,
      }));
    } catch { /* usuario preenche manualmente */ }
  };

  const handleCepBlur = async () => {
    const cep = form.zip_code.replace(/\D/g, "");
    await handleCepLookup(cep);
  };

  const validate = () => {
    const errs = {};
    REQUIRED.forEach((field) => {
      if (!form[field]?.trim()) errs[field] = `${FIELD_LABELS[field]} é obrigatório`;
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Informe um e-mail válido";
    if (form.password && form.password.length < 6)
      errs.password = "A senha deve ter pelo menos 6 caracteres";
    if (form.cpf) {
      const cpfDigits = form.cpf.replace(/\D/g, "");
      if (cpfDigits.length !== 11)
        errs.cpf = "CPF incompleto (11 dígitos)";
      else if (!isValidCpf(form.cpf))
        errs.cpf = "CPF inválido";
    }
    if (form.zip_code && form.zip_code.replace(/\D/g, "").length !== 8)
      errs.zip_code = "CEP incompleto (8 dígitos)";
    return errs;
  };

  const handleSubmit = async () => {
    setGlobalMsg("");
    setStatus("idle");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTimeout(() => {
        document.querySelector("[data-has-error='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setStatus("sending");
    const optional = (val) => val?.trim() || null;
    const payload = {
      full_name: form.full_name.trim(), email: form.email.trim(),
      password: form.password, role: form.role,
      cpf: optional(form.cpf.replace(/\D/g, "")),
      birth_date: optional(form.birth_date), gender: optional(form.gender),
      zip_code: optional(form.zip_code.replace(/\D/g, "")),
      street: optional(form.street), neighborhood: optional(form.neighborhood),
      city: optional(form.city), state: optional(form.state),
      house_number: optional(form.house_number), complement: optional(form.complement),
      education: optional(form.education), job_title: optional(form.job_title),
    };
    try {
      const res = await fetch("/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        setForm(INITIAL_FORM);
        setErrors({});
        return;
      }
      let data = {};
      try { data = await res.json(); } catch { /* body vazio */ }
      const { fieldErrors, globalMessage } = parseApiErrors(res.status, data);
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setGlobalMsg(globalMessage);
      setStatus("error");
    } catch {
      setGlobalMsg("Não foi possível conectar ao servidor. Verifique sua conexão.");
      setStatus("error");
    }
  };

  const ip = (name) => ({
    name, value: form[name], onChange: handleChange,
    error: errors[name], "data-has-error": !!errors[name],
  });

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
          max-width: 760px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pf-card {
          width: 100%;
          max-width: 760px;
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

        .pf-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          margin-bottom: 0.65rem;
        }

        .pf-divider {
          border: none;
          border-top: 1px solid ${C.border};
          margin: 1.5rem 0;
        }

        /* ── Botão primário ── */
        .pf-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0 1.5rem;
          height: 40px;
          border-radius: 8px;
          border: none;
          background: ${C.primary};
          color: #fff;
          font-family: ${FONT_BODY};
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
          box-shadow: 0 1px 4px ${C.primary}44, 0 3px 10px ${C.primary}28;
          letter-spacing: 0.01em;
          white-space: nowrap;
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

        /* ── Botão secundário ── */
        .pf-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
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

        /* ── Alertas ── */
        .pf-alert {
          border-radius: 10px;
          padding: 0.875rem 1.1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          animation: pf-slide-in 0.25s ease;
        }
        .pf-alert-success {
          background: #EDF7F0;
          border: 1.5px solid ${C.success}55;
        }
        .pf-alert-error {
          background: #FDF0F0;
          border: 1.5px solid ${C.error}55;
        }

        .pf-optional-badge {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 600;
          color: ${C.textMuted};
          background: ${C.accent};
          border: 1px solid ${C.border};
          border-radius: 20px;
          padding: 0.05rem 0.42rem;
          margin-left: 0.3rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          vertical-align: middle;
          line-height: 1.6;
        }

        .pf-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }

        .pf-btn-group {
          display: flex;
          gap: 0.6rem;
          align-items: center;
        }

        @media (max-width: 600px) {
          .pf-row > * { flex: 0 0 100% !important; }
          .pf-card-body { padding: 1.5rem 1.25rem 2rem; }
          .pf-page { padding: 1.5rem 1rem 3rem; }
          .pf-footer-row { flex-direction: column-reverse; align-items: stretch; }
          .pf-btn-group { flex-direction: column; }
          .pf-btn-primary, .pf-btn-secondary { width: 100%; height: 44px; }
        }

        @keyframes pf-spin     { to { transform: rotate(360deg); } }
        @keyframes pf-slide-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="pf-page">

        {/* ── Header ── */}
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
            onClick={() => navigate(-1)}
            className="pf-btn-secondary"
            style={{ gap: "0.35rem" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                Cadastro de Usuário
              </h1>
              <p style={{
                margin: 0, color: C.textMuted,
                fontSize: "0.85rem", fontFamily: FONT_BODY,
              }}>
                Preencha os campos obrigatórios para criar a conta. Os demais são opcionais.
              </p>
            </div>

            {/* ── Seção 1: Dados Pessoais ── */}
            <SectionTitle
              title="Dados Pessoais"
              subtitle="Informações de identificação e acesso"
            />

            <div className="pf-row">
              <Field label="Nome completo *" error={errors.full_name}>
                <Input {...ip("full_name")} type="text" placeholder="Ex: Maria da Silva Santos" />
              </Field>
            </div>

            <div className="pf-row">
              <Field label="E-mail *" error={errors.email} half>
                <Input {...ip("email")} type="email" placeholder="colaborador@empresa.com.br" />
              </Field>
              <Field label="Senha *" error={errors.password} half>
                <Input {...ip("password")} type="password" placeholder="Mínimo 6 caracteres" />
              </Field>
            </div>

            <div className="pf-row">
              <Field label={<>CPF <span className="pf-optional-badge">opcional</span></>} error={errors.cpf} third>
                <Input {...ip("cpf")} type="text" placeholder="000.000.000-00" maxLength={14} />
              </Field>
              <Field label={<>Data de nascimento <span className="pf-optional-badge">opcional</span></>} error={errors.birth_date} third>
                <Input {...ip("birth_date")} type="date" style={{ colorScheme: "light" }} />
              </Field>
              <Field label={<>Gênero <span className="pf-optional-badge">opcional</span></>} error={errors.gender} third>
                <Select {...ip("gender")}>
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="nao_binario">Não-binário</option>
                  <option value="prefiro_nao_informar">Prefiro não informar</option>
                </Select>
              </Field>
            </div>

            <div className="pf-row">
              <Field label="Perfil de acesso *" error={errors.role} half>
                <Select {...ip("role")}>
                  <option value="">Selecione o perfil</option>
                  <option value="admin">Administrador</option>
                  <option value="assistente">Assistente</option>
                  <option value="funcionario">Funcionário</option>
                </Select>
              </Field>
            </div>

            <hr className="pf-divider" />

            {/* ── Seção 2: Endereço ── */}
            <SectionTitle
              title="Endereço"
              subtitle="Localização residencial — todos os campos opcionais"
            />

            <div className="pf-row">
              <Field label={<>CEP <span className="pf-optional-badge">opcional</span></>} error={errors.zip_code} third>
                <Input
                  {...ip("zip_code")} type="text" placeholder="00000-000"
                  maxLength={9} onBlur={handleCepBlur}
                />
              </Field>
              <Field label={<>Logradouro <span className="pf-optional-badge">opcional</span></>} error={errors.street} twoThird>
                <Input {...ip("street")} type="text" placeholder="Rua, Avenida, Travessa..." />
              </Field>
            </div>

            <div className="pf-row">
              <Field label={<>Número <span className="pf-optional-badge">opcional</span></>} error={errors.house_number} third>
                <Input {...ip("house_number")} type="text" placeholder="Ex: 123" />
              </Field>
              <Field label={<>Complemento <span className="pf-optional-badge">opcional</span></>} error={errors.complement} twoThird>
                <Input {...ip("complement")} type="text" placeholder="Apto, Bloco, Casa..." />
              </Field>
            </div>

            <div className="pf-row">
              <Field label={<>Bairro <span className="pf-optional-badge">opcional</span></>} error={errors.neighborhood} third>
                <Input {...ip("neighborhood")} type="text" placeholder="Nome do bairro" />
              </Field>
              <Field label={<>Cidade <span className="pf-optional-badge">opcional</span></>} error={errors.city} third>
                <Input {...ip("city")} type="text" placeholder="Nome da cidade" />
              </Field>
              <Field label={<>Estado (UF) <span className="pf-optional-badge">opcional</span></>} error={errors.state} third>
                <Select {...ip("state")}>
                  <option value="">UF</option>
                  {[
                    "AC","AL","AP","AM","BA","CE","DF","ES","GO",
                    "MA","MT","MS","MG","PA","PB","PR","PE","PI",
                    "RJ","RN","RS","RO","RR","SC","SP","SE","TO",
                  ].map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </Select>
              </Field>
            </div>

            <hr className="pf-divider" />

            {/* ── Seção 3: Dados Profissionais ── */}
            <SectionTitle
              title="Dados Profissionais"
              subtitle="Informações de cargo e formação — todos os campos opcionais"
            />

            <div className="pf-row">
              <Field label={<>Cargo <span className="pf-optional-badge">opcional</span></>} error={errors.job_title} half>
                <Input {...ip("job_title")} type="text" placeholder="Ex: Analista de RH" />
              </Field>
              <Field label={<>Formação acadêmica <span className="pf-optional-badge">opcional</span></>} error={errors.education} half>
                <Select {...ip("education")}>
                  <option value="">Selecione</option>
                  <option value="ensino_medio">Ensino Médio</option>
                  <option value="tecnico">Técnico</option>
                  <option value="graduacao">Graduação</option>
                  <option value="pos_graduacao">Pós-Graduação / MBA</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </Select>
              </Field>
            </div>

            <hr className="pf-divider" />

            {/* ── Alertas de feedback ── */}
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
                    Cadastro realizado com sucesso!
                  </div>
                  <div style={{ fontSize: "0.78rem", color: C.success, marginTop: "0.1rem", opacity: 0.85 }}>
                    O usuário foi registrado no PeopleFlow.
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="pf-alert pf-alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.error}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: "1px" }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <div style={{ fontWeight: 700, color: C.error, fontSize: "0.875rem" }}>
                    {globalMsg ? "Falha ao cadastrar" : "Corrija os campos destacados"}
                  </div>
                  {globalMsg && (
                    <div style={{ fontSize: "0.78rem", color: C.error, marginTop: "0.1rem", opacity: 0.85 }}>
                      {globalMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="pf-footer-row">
              <p style={{
                margin: 0, fontSize: "0.72rem",
                color: C.textMuted, fontFamily: FONT_BODY,
              }}>
                * Campos obrigatórios
              </p>

              <div className="pf-btn-group">
                <button
                  type="button"
                  className="pf-btn-secondary"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setErrors({});
                    setStatus("idle");
                    setGlobalMsg("");
                  }}
                >
                  Limpar
                </button>

                <button
                  type="button"
                  className="pf-btn-primary"
                  onClick={handleSubmit}
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <><Spinner /> Enviando...</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Cadastrar Usuário
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const C = {
	primary: "#C2622D",
	primaryHover: "#A8521F",
	bg: "#FAF5F0",
	surface: "#FFFFFF",
	border: "#E8D5C4",
	borderFocus: "#C2622D",
	text: "#3B1F0E",
	textMuted: "#8B6555",
	accent: "#F5EDE4",
	success: "#4A7A5A",
	error: "#B94040",
};

const FONT_BODY = "'Source Sans 3', 'Segoe UI', Arial, sans-serif";
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

const EMPTY_FORM = {
	full_name: "",
	email: "",
	role: "",
	cpf: "",
	birth_date: "",
	gender: "",
	zip_code: "",
	street: "",
	neighborhood: "",
	city: "",
	state: "",
	house_number: "",
	complement: "",
	education: "",
	job_title: "",
};

function getSession() {
	try {
		const raw = localStorage.getItem("pf_session") || sessionStorage.getItem("pf_session");
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function toForm(user) {
	return {
		full_name: user?.full_name || "",
		email: user?.email || "",
		role: user?.role || "",
		cpf: user?.cpf ? masks.cpf(user.cpf) : "",
		birth_date: user?.birth_date || "",
		gender: user?.gender || "",
		zip_code: user?.zip_code ? masks.zip_code(user.zip_code) : "",
		street: user?.street || "",
		neighborhood: user?.neighborhood || "",
		city: user?.city || "",
		state: user?.state || "",
		house_number: user?.house_number || "",
		complement: user?.complement || "",
		education: user?.education || "",
		job_title: user?.job_title || "",
	};
}

function Input({ label, name, value, onChange, type = "text", disabled = false }) {
	return (
		<div style={{ display: "grid", gap: "0.25rem" }}>
			<label style={{ fontSize: "0.7rem", fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{label}</label>
			<input
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				disabled={disabled}
				style={{
					width: "100%",
					padding: "0.6rem 0.8rem",
					borderRadius: "8px",
					border: `1.5px solid ${C.border}`,
					background: disabled ? "#f8f5f1" : C.surface,
					color: C.text,
					fontSize: "0.88rem",
					fontFamily: FONT_BODY,
					outline: "none",
				}}
			/>
		</div>
	);
}

function Select({ label, name, value, onChange, disabled = false, children }) {
	return (
		<div style={{ display: "grid", gap: "0.25rem" }}>
			<label style={{ fontSize: "0.7rem", fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{label}</label>
			<select
				name={name}
				value={value}
				onChange={onChange}
				disabled={disabled}
				style={{
					width: "100%",
					padding: "0.6rem 0.8rem",
					borderRadius: "8px",
					border: `1.5px solid ${C.border}`,
					background: disabled ? "#f8f5f1" : C.surface,
					color: C.text,
					fontSize: "0.88rem",
					fontFamily: FONT_BODY,
				}}
			>
				{children}
			</select>
		</div>
	);
}

function SectionTitle({ title, subtitle }) {
	return (
		<div style={{ marginBottom: "1rem" }}>
			<h2 style={{
				fontFamily: FONT_TITLE,
				fontSize: "0.98rem",
				fontWeight: 700,
				color: C.text,
				margin: "0 0 0.2rem",
			}}>
				{title}
			</h2>
			{subtitle && (
				<p style={{ margin: 0, color: C.textMuted, fontSize: "0.78rem" }}>
					{subtitle}
				</p>
			)}
		</div>
	);
}

export default function EditUser() {
	const navigate = useNavigate();
	const session = useMemo(() => getSession(), []);
	const role = session?.role || "funcionario";
	const isEmployee = role === "funcionario";

	const [users, setUsers] = useState([]);
	const [selectedId, setSelectedId] = useState("");
	const [form, setForm] = useState(EMPTY_FORM);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (!session?.email && !session?.user_id) {
			navigate("/login", { replace: true });
			return;
		}

		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/users/");
				if (!res.ok) throw new Error();
				const data = await res.json();
				const list = Array.isArray(data) ? data : [];
				setUsers(list);

				if (isEmployee) {
					const own = list.find((u) => u.email === session.email || u.id === session.user_id);
					if (own) {
						setSelectedId(own.id);
						setForm(toForm(own));
					}
				}
			} catch {
				setError("Não foi possível carregar os usuários.");
			} finally {
				setLoading(false);
			}
		})();
	}, [isEmployee, navigate, session?.email, session?.user_id]);

	const chooseUser = (user) => {
		setSelectedId(user.id);
		setForm(toForm(user));
		setMsg("");
		setError("");
	};

	const onChange = (e) => {
		const { name, value } = e.target;
		let next = value;
		if (name === "cpf") next = masks.cpf(value);
		if (name === "zip_code") next = masks.zip_code(value);
		setForm((prev) => ({ ...prev, [name]: next }));
	};

	const updateLocalUser = (updated) => {
		setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
		setForm(toForm(updated));
	};

	const handleSave = async () => {
		if (!selectedId) return;
		setSaving(true);
		setMsg("");
		setError("");

		const optional = (v) => (v?.trim() ? v.trim() : null);
		const payload = {
			full_name: optional(form.full_name),
			email: optional(form.email),
			role: isEmployee ? undefined : optional(form.role),
			cpf: optional(form.cpf.replace(/\D/g, "")),
			birth_date: optional(form.birth_date),
			gender: optional(form.gender),
			zip_code: optional(form.zip_code.replace(/\D/g, "")),
			street: optional(form.street),
			neighborhood: optional(form.neighborhood),
			city: optional(form.city),
			state: optional(form.state),
			house_number: optional(form.house_number),
			complement: optional(form.complement),
			education: optional(form.education),
			job_title: optional(form.job_title),
		};

		Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

		try {
			const res = await fetch(`/users/${selectedId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error();
			const updated = await res.json();
			updateLocalUser(updated);
			setMsg("Dados atualizados com sucesso.");
		} catch {
			setError("Não foi possível salvar as alterações.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div style={{ minHeight: "100vh", background: C.bg, padding: "2.5rem 1rem 4rem" }}>
			<div style={{ maxWidth: 980, margin: "0 auto" }}>
				<header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
						<div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryHover})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
							<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
						</div>
						<div>
							<div style={{ fontFamily: FONT_TITLE, fontWeight: 900, fontSize: "1rem", color: C.text, lineHeight: 1.1 }}>
								People<span style={{ color: C.primary }}>Flow</span>
							</div>
							<div style={{ fontSize: "0.6rem", color: C.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>Gestão de Pessoas</div>
						</div>
					</div>
					<button
						type="button"
						onClick={() => navigate("/menu")}
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "0.35rem",
							border: `1.5px solid ${C.border}`,
							borderRadius: 8,
							padding: "0.45rem 0.8rem",
							background: "transparent",
							color: C.primary,
							cursor: "pointer",
							fontWeight: 700,
							fontFamily: FONT_BODY,
						}}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="15 18 9 12 15 6" />
						</svg>
						Voltar
					</button>
				</header>

				<main style={{ background: C.surface, borderRadius: 16, boxShadow: "0 2px 24px rgba(59,31,14,0.08), 0 1px 4px rgba(59,31,14,0.04)", overflow: "hidden" }}>
					<div style={{ height: 4, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryHover}, #E8B87A)` }} />
					<div style={{ padding: "2rem 2.25rem 2.25rem" }}>
						<div style={{ marginBottom: "1.75rem" }}>
							<h1 style={{ margin: "0 0 0.3rem", fontFamily: FONT_TITLE, fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)", fontWeight: 900, color: C.text }}>Editar usuário</h1>
							<p style={{ margin: 0, color: C.textMuted, fontSize: "0.85rem" }}>Abra um cadastro, ajuste os campos desejados e salve as alterações.</p>
						</div>

						{loading && <p style={{ color: C.textMuted, margin: 0 }}>Carregando usuários...</p>}
						{!loading && error && <div style={{ borderRadius: 10, padding: "0.875rem 1.1rem", background: "#FDF0F0", border: `1.5px solid ${C.error}55`, color: C.error, fontWeight: 700, marginBottom: "1rem" }}>{error}</div>}
						{!loading && msg && <div style={{ borderRadius: 10, padding: "0.875rem 1.1rem", background: "#EDF7F0", border: `1.5px solid ${C.success}55`, color: C.success, fontWeight: 700, marginBottom: "1rem" }}>{msg}</div>}

						{!loading && !isEmployee && (
							<section style={{ marginBottom: "1.5rem" }}>
								<SectionTitle title="Seleção de usuário" subtitle="Admin e assistente podem editar qualquer cadastro." />
								<div style={{ display: "grid", gap: "0.55rem" }}>
									{users.map((u) => (
										<button
											key={u.id}
											type="button"
											onClick={() => chooseUser(u)}
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												gap: "1rem",
												padding: "0.9rem 1rem",
												borderRadius: 10,
												border: `1.5px solid ${selectedId === u.id ? C.primary : C.border}`,
												background: selectedId === u.id ? C.accent : C.surface,
												cursor: "pointer",
												textAlign: "left",
												fontFamily: FONT_BODY,
											}}
										>
											<div style={{ minWidth: 0 }}>
												<div style={{ fontWeight: 700, fontSize: "0.88rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.full_name}</div>
												<div style={{ color: C.textMuted, fontSize: "0.76rem" }}>{u.email}</div>
											</div>
											<span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.primary, whiteSpace: "nowrap" }}>Editar</span>
										</button>
									))}
								</div>
							</section>
						)}

						{!loading && selectedId && (
							<>
								<section style={{ marginBottom: "1.5rem" }}>
									<SectionTitle title="Dados pessoais" subtitle="Campos principais do cadastro." />
									<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem" }}>
										<Input label="Nome" name="full_name" value={form.full_name} onChange={onChange} />
										<Input label="E-mail" name="email" value={form.email} onChange={onChange} />
										<Select label="Perfil" name="role" value={form.role} onChange={onChange} disabled={isEmployee}>
											<option value="">Selecione</option>
											<option value="admin">Administrador</option>
											<option value="assistente">Assistente</option>
											<option value="funcionario">Funcionário</option>
										</Select>
										<Input label="CPF" name="cpf" value={form.cpf} onChange={onChange} />
										<Input label="Data de nascimento" name="birth_date" type="date" value={form.birth_date} onChange={onChange} />
										<Select label="Gênero" name="gender" value={form.gender} onChange={onChange}>
											<option value="">Selecione</option>
											<option value="masculino">Masculino</option>
											<option value="feminino">Feminino</option>
											<option value="nao_binario">Não-binário</option>
											<option value="prefiro_nao_informar">Prefiro não informar</option>
										</Select>
									</div>
								</section>

								<section style={{ marginBottom: "1.5rem" }}>
									<SectionTitle title="Endereço" subtitle="Preencha apenas o que desejar manter no cadastro." />
									<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem" }}>
										<Input label="CEP" name="zip_code" value={form.zip_code} onChange={onChange} />
										<Input label="Logradouro" name="street" value={form.street} onChange={onChange} />
										<Input label="Bairro" name="neighborhood" value={form.neighborhood} onChange={onChange} />
										<Input label="Cidade" name="city" value={form.city} onChange={onChange} />
										<Input label="Estado" name="state" value={form.state} onChange={onChange} />
										<Input label="Número" name="house_number" value={form.house_number} onChange={onChange} />
										<Input label="Complemento" name="complement" value={form.complement} onChange={onChange} />
									</div>
								</section>

								<section>
									<SectionTitle title="Dados profissionais" subtitle="Cargo e formação podem ser ajustados a qualquer momento." />
									<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem" }}>
										<Input label="Cargo" name="job_title" value={form.job_title} onChange={onChange} />
										<Select label="Formação" name="education" value={form.education} onChange={onChange}>
											<option value="">Selecione</option>
											<option value="ensino_medio">Ensino Médio</option>
											<option value="tecnico">Técnico</option>
											<option value="graduacao">Graduação</option>
											<option value="pos_graduacao">Pós-Graduação / MBA</option>
											<option value="mestrado">Mestrado</option>
											<option value="doutorado">Doutorado</option>
										</Select>
									</div>
								</section>

								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.75rem", paddingTop: "1rem", borderTop: `1px solid ${C.border}` }}>
									<p style={{ margin: 0, color: C.textMuted, fontSize: "0.72rem" }}>Campos em branco serão salvos vazios quando necessário.</p>
									<div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
										<button type="button" onClick={handleSave} disabled={saving} style={{ border: "none", borderRadius: 8, padding: "0.55rem 0.95rem", background: C.primary, color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: FONT_BODY }}>
											{saving ? "Salvando..." : "Salvar alterações"}
										</button>
									</div>
								</div>
							</>
						)}

						{!loading && !selectedId && (
							<p style={{ color: C.textMuted, margin: 0 }}>
								{isEmployee ? "Não foi possível localizar seu cadastro para edição." : "Selecione um usuário para editar."}
							</p>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}

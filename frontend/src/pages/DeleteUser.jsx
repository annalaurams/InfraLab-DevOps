import { useEffect, useMemo, useState } from "react";
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

function getSession() {
	try {
		const raw = localStorage.getItem("pf_session") || sessionStorage.getItem("pf_session");
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function initials(name) {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0][0].toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatCpf(raw) {
	if (!raw) return "-";
	const d = raw.replace(/\D/g, "");
	if (d.length !== 11) return raw;
	return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function UserRow({ user, onDelete }) {
	const [hovered, setHovered] = useState(false);
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: "1rem",
				padding: "0.95rem 1rem",
				borderRadius: 12,
				border: `1.5px solid ${C.border}`,
				background: hovered ? C.accent : C.surface,
				transition: "background 0.15s, border-color 0.15s",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: 0 }}>
				<div style={{
					width: 42,
					height: 42,
					borderRadius: "50%",
					background: C.primary + "1A",
					color: C.primary,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontWeight: 700,
					fontSize: "0.85rem",
					fontFamily: FONT_BODY,
					flexShrink: 0,
				}}>
					{initials(user.full_name)}
				</div>
				<div style={{ minWidth: 0 }}>
					<div style={{ fontWeight: 700, fontSize: "0.9rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{user.full_name}
					</div>
					<div style={{ fontSize: "0.75rem", color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{user.email} · {ROLE_LABELS[user.role] || user.role}
					</div>
					<div style={{ fontSize: "0.75rem", color: C.textMuted, marginTop: "0.15rem" }}>
						CPF: {formatCpf(user.cpf)}
					</div>
				</div>
			</div>

			<button
				type="button"
				onClick={() => onDelete(user)}
				style={{
					border: "none",
					borderRadius: 8,
					padding: "0.5rem 0.75rem",
					background: C.error,
					color: "#fff",
					cursor: "pointer",
					fontWeight: 700,
					fontFamily: FONT_BODY,
					whiteSpace: "nowrap",
				}}
			>
				Deletar
			</button>
		</div>
	);
}

export default function DeleteUser() {
	const navigate = useNavigate();
	const session = useMemo(() => getSession(), []);
	const role = session?.role || "funcionario";
	const isAdmin = role === "admin";

	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [msg, setMsg] = useState("");
	const [query, setQuery] = useState("");

	useEffect(() => {
		if (!session?.email && !session?.user_id) {
			navigate("/login", { replace: true });
			return;
		}
		if (!isAdmin) {
			navigate("/menu", { replace: true });
			return;
		}

		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/users/");
				if (!res.ok) throw new Error();
				const data = await res.json();
				setUsers(Array.isArray(data) ? data : []);
			} catch {
				setError("Não foi possível carregar os usuários.");
			} finally {
				setLoading(false);
			}
		})();
	}, [isAdmin, navigate, session?.email, session?.user_id]);

	const filteredUsers = users.filter((u) => {
		const q = query.trim().toLowerCase();
		if (!q) return true;
		return (
			(u.full_name || "").toLowerCase().includes(q) ||
			(u.email || "").toLowerCase().includes(q) ||
			(u.cpf || "").replace(/\D/g, "").includes(q.replace(/\D/g, ""))
		);
	});

	const handleDelete = async (user) => {
		const ok = window.confirm(`Deseja realmente deletar ${user.full_name}?`);
		if (!ok) return;

		try {
			const res = await fetch(`/users/${user.id}`, { method: "DELETE" });
			if (!res.ok && res.status !== 204) throw new Error();
			setUsers((prev) => prev.filter((u) => u.id !== user.id));
			setMsg(`Usuário ${user.full_name} deletado com sucesso.`);
			setError("");
		} catch {
			setError("Não foi possível deletar o usuário.");
			setMsg("");
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
						<div style={{ marginBottom: "1.5rem" }}>
							<h1 style={{ margin: "0 0 0.3rem", fontFamily: FONT_TITLE, fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)", fontWeight: 900, color: C.text }}>Excluir usuário</h1>
							<p style={{ margin: 0, color: C.textMuted, fontSize: "0.85rem" }}>Selecione um usuário e confirme a exclusão.</p>
						</div>

						<div style={{ marginBottom: "1rem" }}>
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Buscar por nome, e-mail ou CPF..."
								style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: 10, border: `1.5px solid ${C.border}`, outline: "none", fontFamily: FONT_BODY, fontSize: "0.9rem" }}
							/>
						</div>

						{loading && <p style={{ color: C.textMuted, margin: 0 }}>Carregando usuários...</p>}
						{!loading && error && <div style={{ borderRadius: 10, padding: "0.875rem 1.1rem", background: "#FDF0F0", border: `1.5px solid ${C.error}55`, color: C.error, fontWeight: 700, marginBottom: "1rem" }}>{error}</div>}
						{!loading && msg && <div style={{ borderRadius: 10, padding: "0.875rem 1.1rem", background: "#EDF7F0", border: `1.5px solid ${C.success}55`, color: C.success, fontWeight: 700, marginBottom: "1rem" }}>{msg}</div>}

						{!loading && !error && (
							<div style={{ display: "grid", gap: "0.55rem" }}>
								{filteredUsers.length === 0 ? (
									<p style={{ margin: 0, color: C.textMuted }}>Nenhum usuário encontrado.</p>
								) : (
									filteredUsers.map((user) => <UserRow key={user.id} user={user} onDelete={handleDelete} />)
								)}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
import { Navigate } from "react-router-dom";

function getSession() {
  try {
    const raw = localStorage.getItem("pf_session") || sessionStorage.getItem("pf_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function PrivateRoute({ children }) {
  const session = getSession();
  if (!session || !session.token) {
    return <Navigate to="/frontend/login" replace />;
  }
  return children;
}
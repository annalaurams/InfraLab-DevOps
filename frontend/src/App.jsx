import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegisterForm from "./pages/RegisterForm";
import UserMenu from "./pages/UserMenu";
import EditUser from "./pages/EditUser";
import DeleteUser from "./pages/DeleteUser";
import UserList from "./pages/UserList";

function App() {
  return (
    <BrowserRouter basename="/frontend">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/menu" element={<UserMenu />} />
        <Route path="/edit-user" element={<EditUser />} />
        <Route path="/list-user" element={<UserList />} />
        <Route path="/delete-user" element={<DeleteUser />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegisterForm from "./pages/RegisterForm";
import UserMenu from "./pages/UserMenu";
import EditUser from "./pages/EditUser";
import DeleteUser from "./pages/DeleteUser";
import UserList from "./pages/UserList";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <BrowserRouter basename="/frontend">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/menu" element={
          <PrivateRoute>
            <UserMenu />
          </PrivateRoute>
        } />
        <Route path="/edit-user" element={
          <PrivateRoute>
            <EditUser />
          </PrivateRoute>
        } />
        <Route path="/list-user" element={
          <PrivateRoute>
            <UserList />
          </PrivateRoute>
        } />
        <Route path="/delete-user" element={
          <PrivateRoute>
            <DeleteUser />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RsoDashboard from "./pages/RsoDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/rsos" element={<RsoDashboard />}></Route>
        <Route
          path="/super-admin-dashboard"
          element={<SuperAdminDashboard />}
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

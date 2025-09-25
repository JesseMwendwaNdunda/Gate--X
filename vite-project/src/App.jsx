import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import VehicleEntryForm from "./components/VehicleEntryForm";
import VehicleList from "./components/VehicleList";
import Navbar from "./components/Navbar";
import GuardDashboard from "./components/GuardDashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./index.css";

function App() {
  const PrivateRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem("role");
    if (!role) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;
    return children;
  };

  const DashboardRedirect = () => {
    const role = localStorage.getItem("role");
    if (role === "guard") return <Navigate to="/dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (role === "office") return <Navigate to="/vehicles" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Guard routes */}
        <Route path="/entry" element={
          <PrivateRoute allowedRoles={["guard"]}>
            <VehicleEntryForm />
          </PrivateRoute>
        }/>
        <Route path="/dashboard" element={
          <PrivateRoute allowedRoles={["guard"]}>
            <GuardDashboard />
          </PrivateRoute>
        }/>

        {/* Admin route */}
        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }/>

        {/* Office/admin vehicle list route */}
        <Route path="/vehicles" element={
          <PrivateRoute allowedRoles={["admin","office"]}>
            <VehicleList />
          </PrivateRoute>
        }/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

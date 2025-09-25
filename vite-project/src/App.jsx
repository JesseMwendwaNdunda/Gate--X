import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import VehicleEntryForm from "./components/VehicleEntryForm";
import VehicleList from "./components/VehicleList";
import Navbar from "./components/Navbar"

function App() {
  const PrivateRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem("role");
    if (!role) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        <Route
          path="/entry"
          element={
            <PrivateRoute allowedRoles={["guard"]}>
              <VehicleEntryForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <PrivateRoute allowedRoles={["admin", "office"]}>
              <VehicleList />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


import { Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import PendaftaranMagang from "./pages/user/PendaftaranMagang";
import Beranda from "./pages/Beranda";
import StatusMagang from "./pages/user/StatusMagang";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();
  return (
    <>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route
          path="/pendaftaran-magang"
          element={
            <ProtectedRoute>
              <PendaftaranMagang />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status-magang"
          element={
            <ProtectedRoute>
              <StatusMagang />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;

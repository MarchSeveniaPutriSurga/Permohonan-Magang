import { Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import PendaftaranMagang from "./pages/user/PendaftaranMagang";
import Beranda from "./pages/Beranda";
import StatusMagang from "./pages/user/StatusMagang";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LogActivity from "./pages/user/LogActivity";

function App() {
  const location = useLocation();

  const noFooterPaths = ["/login", "/register"];
  const isDashboard = location.pathname.startsWith("/dashboard");
  const hideFooter = noFooterPaths.includes(location.pathname) || isDashboard;

  return (
    <>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pendaftaran-magang"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <PendaftaranMagang />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status-magang"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <StatusMagang />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-activity"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <LogActivity />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/dashboard/*" element={<Dashboard />} /> */}
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}

export default App;

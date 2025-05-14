import { Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import PendaftaranMagang from "./pages/user/PendaftaranMagang";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
// import 'bootstrap/dist/css/bootstrap.min.css';
import Beranda from "./pages/Beranda";
import StatusMagang from "./pages/user/StatusMagang";

function App() {
  const location = useLocation();
  return (
    <>
      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/pendaftaran-magang" element={<PendaftaranMagang />} />
        <Route path="/" element={<Beranda />} />
        <Route path="/pendaftaran-magang" element={<PendaftaranMagang />} />
        <Route path="/status-magang" element={<StatusMagang />} />

      </Routes>
      <Footer />
    </>
  );
}

export default App;
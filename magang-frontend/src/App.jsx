import { BrowserRouter, Routes, Route } from "react-router-dom";
import PendaftaranMagang from "./pages/user/PendaftaranMagang";
import Dashboard from "./pages/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/pendaftaran-magang" element={<PendaftaranMagang />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
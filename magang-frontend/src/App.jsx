import { Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import PendaftaranMagang from "./pages/user/PendaftaranMagang";
import Beranda from "./pages/Beranda";
import StatusMagang from "./pages/user/StatusMagang";

function App() {
  const location = useLocation();
  return (
    <>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/pendaftaran-magang" element={<PendaftaranMagang />} />
        <Route path="/status-magang" element={<StatusMagang />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;

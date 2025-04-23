import { BrowserRouter, Routes, Route } from "react-router-dom";
import PendaftaranMagang from "./pages/user/PendaftaranMagang";
import Dashboard from "./pages/Dashboard";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/" element={<PendaftaranMagang />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

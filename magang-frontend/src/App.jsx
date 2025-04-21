import { BrowserRouter, Routes, Route } from "react-router-dom";
import PendaftaranMagang from "./pages/user/PendaftaranMagang";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PendaftaranMagang />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

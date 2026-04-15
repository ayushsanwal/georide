import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RiderPage from "./pages/RiderPage";
import DriverPage from "./pages/DriverPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rider" element={<RiderPage />} />
        <Route path="/driver" element={<DriverPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
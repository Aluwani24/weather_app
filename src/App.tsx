import { Route, Routes } from "react-router-dom";
import Home from "./routes/Home";
import Settings from "./routes/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}


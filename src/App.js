import Signature from "./Signature";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signature/:sno" element={<Signature />} />
      </Routes>
    </Router>
  );
}

export default App;

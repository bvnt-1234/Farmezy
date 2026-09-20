import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Prices from "./pages/Prices";

function Home() {
  return (
    <main className="hero">
      <h1>🌾 Farmezy</h1>

      <h2>Connecting Farmers to Better Opportunities</h2>

      <p>
        Check current mandi prices, predict crop prices,
        find buyers and get assistance from Farmezy.
      </p>

      <div className="button-container">

        <Link to="/prices">
          <button className="action-button">
            💰 Check Mandi Prices
          </button>
        </Link>

        <button className="action-button">
          📈 Predict Crop Price
        </button>

        <button className="action-button">
          🛒 Find Buyers
        </button>

        <button className="action-button">
          🤖 Ask Farmezy
        </button>

      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        <nav className="navbar">
          <Link to="/" className="logo">
            🌾 Farmezy
          </Link>

          <button className="language">
            🌐 English
          </button>
        </nav>

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/prices" element={<Prices />} />

        </Routes>

      </div>

    </BrowserRouter>
  );
}


export default App;
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Prices from "./pages/Prices";

function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="tagline">🌱 Technology for better farming</p>

          <h1>
            Smart farming.
            <br />
            Better opportunities.
          </h1>

          <p className="hero-text">
            Farmezy helps farmers check market prices, predict crop prices,
            connect with buyers and get useful information — all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/prices" className="primary-button">
              💰 Check Mandi Prices
            </Link>

            <button className="secondary-button">
              🤖 Ask Farmezy
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-heading">
          <p>WHAT FARMEZY OFFERS</p>
          <h2>Everything a farmer needs</h2>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Mandi Prices</h3>
            <p>
              Check current crop prices from different markets.
            </p>
            <Link to="/prices">View prices →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Price Prediction</h3>
            <p>
              Get an estimated future crop price using ML.
            </p>
            <button>Coming soon →</button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>Find Buyers</h3>
            <p>
              Connect directly with potential buyers for your crops.
            </p>
            <button>Coming soon →</button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Ask Farmezy</h3>
            <p>
              Ask questions about prices, markets and farming.
            </p>
            <button>Coming soon →</button>
          </div>

        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        {/* Navbar */}
        <nav className="navbar">

          <Link to="/" className="logo">
            🌾 <span>Farmezy</span>
          </Link>

          <div className="nav-links">
            <Link to="/prices">Prices</Link>
            <a href="#features">Features</a>
            <button>🌐 English</button>
          </div>

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
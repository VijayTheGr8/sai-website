import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Dashboard from "./Dashboard";
import "./App.css";

const TopBar = () => (
  <div className="topbar">
    <div className="topbar-logos">
      <img src="/1.png" alt="Logo 1" className="topbar-logo" />
      <img src="/logo.png" alt="Logo 3" className="topbar-logo" />
      <div className="topbar-logo-center">
        <img src="/logo2.png" alt="Logo 4" className="topbar-logo" />
      </div>
    </div>
    <div className="topbar-buttons">
      <Link to="/signup" className="topbar-btn signup">Sign Up</Link>
      <Link to="/login" className="topbar-btn login">Login</Link>
    </div>
  </div>
);

const CenteredBackgroundImage = () => (
  <div className="centered-bg-image">
    <img src="/2.png" alt="Center" className="centered-bg-img" />
  </div>
);

const CenteredCard = () => (
  <div className="centered-card">
    <h2 className="centered-card-title">Sathya Sai Baba’s Nine Point Code of Conduct</h2>
    <p className="centered-card-desc">
      Bhagawan Sri Sathya Sai Baba proclaimed the Nine Point Code of Conduct as a guiding light for every devotee’s spiritual and personal development.
    </p>
    <blockquote className="centered-card-quote">
      “It is the Code of Conduct which is responsible for the Organization moving forward, growing from strength to strength. The office bearers should exercise maximum care to see that the Code of Conduct is adhered to and guide others also in the right path… There should be no scramble for power or position. What matters is the purity, intensity of devotion and the spirit of self-sacrifice.”<br />
      <span className="centered-card-quote-attrib">~ Baba</span>
    </blockquote>
    <p className="centered-card-cta">
      Please log in or sign up to access the 100-Day Daily Life Character & Conduct Reflection Tracker.
    </p>
  </div>
);

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-content">
      <p className="site-footer-year">I to SAI © {new Date().getFullYear()}</p>
      <p>• Sri Sathya Sai Baba Centre of Toronto York •</p>
    </div>
  </footer>
);

const Home = () => (
  <>
    <TopBar />
    <CenteredBackgroundImage />
    <CenteredCard />
    <Footer />
  </>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;

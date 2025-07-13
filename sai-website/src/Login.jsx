import React, { useState } from "react";
import "./Login.css";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

const InfoCard = () => (
  <div className="login-info-card">
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

const LoginCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Logged in!");
      navigate("/dashboard");
    }
  };

  return (
    <form className="login-card" onSubmit={handleLogin}>
      <h2 className="login-card-title">Login</h2>
      <label className="login-label">
        Email
        <input
          type="email"
          className="login-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="login-label">
        Password
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <div className="login-error">{error}</div>}
      {success && <div className="login-success">{success}</div>}
      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

const Login = () => (
  <div className="login-bg">
    <div className="login-cards-row">
      <InfoCard />
      <LoginCard />
    </div>
  </div>
);

export default Login;

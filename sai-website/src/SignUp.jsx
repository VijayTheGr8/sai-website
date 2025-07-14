import React, { useState } from "react";
import "./SignUp.css";
import { supabase } from "./supabaseClient";

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

const SignUpCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }
    // Create profile row with email and empty responses
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ email, responses: {} }]);
    setLoading(false);
    if (profileError) {
      setError("Account created, but failed to initialize profile: " + profileError.message);
    } else {
      setSuccess("Account created! Please check your email to confirm.");
      // Optionally redirect or update app state
    }
  };

  return (
    <form className="login-card" onSubmit={handleSignUp}>
      <h2 className="login-card-title">Sign Up</h2>
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
      <label className="login-label">
        Confirm Password
        <input
          type="password"
          className="login-input"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </label>
      {error && <div className="login-error">{error}</div>}
      {success && <div className="login-success">{success}</div>}
      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};

const SignUp = () => (
  <div className="login-bg">
    <div className="login-cards-row">
      <InfoCard />
      <SignUpCard />
    </div>
  </div>
);

export default SignUp; 
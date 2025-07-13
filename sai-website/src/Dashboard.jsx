import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const questions = [
  "Did I take a few moments today for quiet reflection, prayer, or mindfulness?",
  "Did I engage in or encourage any form of spiritual practice or uplifting activity with my family?",
  "Have I supported the spiritual or moral development of children in my home (e.g., shared a story, guided behavior, or encouraged good values)?",
  "Did I take part in or support any service activity—big or small—today (e.g., helping someone, donating, or volunteering)?",
  "Have I stayed connected with my spiritual or community group by attending a session, even virtually, today?",
  "Did I read, watch, or listen to something today that helped me grow spiritually or morally?",
  "Did I make a conscious effort to speak gently and lovingly, even when stressed or frustrated?",
  "Did I avoid gossiping or judging others—especially when they weren’t present?",
  "Did I consciously avoid wasting time, money, food, or energy—and redirect it toward something helpful or meaningful?"
];

const TopBar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return (
    <div className="topbar dashboard-topbar">
      <div className="topbar-logos">
        <img src="/1.png" alt="Logo 1" className="topbar-logo" />
        <img src="/logo.png" alt="Logo 3" className="topbar-logo" />
        <div className="topbar-logo-center">
          <img src="/logo2.png" alt="Logo 4" className="topbar-logo" />
        </div>
      </div>
      <div className="topbar-buttons">
        <button className="topbar-btn login" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
};

const Carousel = () => {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(Array(questions.length).fill(false));
  const prev = () => setIndex(i => (i === 0 ? questions.length - 1 : i - 1));
  const next = () => setIndex(i => (i === questions.length - 1 ? 0 : i + 1));
  const handleCheckboxChange = () => {
    setChecked(prevChecked => {
      const updated = [...prevChecked];
      updated[index] = !updated[index];
      return updated;
    });
  };
  return (
    <div className="dashboard-carousel">
      <div className="dashboard-carousel-question-count">
        Question {index + 1} of {questions.length}
      </div>
      <div className="dashboard-carousel-row">
        <button
          onClick={prev}
          aria-label="Previous"
          className="dashboard-carousel-arrow left"
        >
          &#8592;
        </button>
        <div className="dashboard-carousel-question-border">
          <div className="dashboard-carousel-checkbox-corner">
            <label className="dashboard-carousel-checkbox-label">
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={handleCheckboxChange}
                className="dashboard-carousel-checkbox"
              />
              <span className="dashboard-carousel-custom-checkbox"></span>
            </label>
          </div>
          <div className="dashboard-carousel-question">
            {questions[index]}
          </div>
        </div>
        <button
          onClick={next}
          aria-label="Next"
          className="dashboard-carousel-arrow right"
        >
          &#8594;
        </button>
      </div>
      <button className="dashboard-carousel-submit-btn">Submit</button>
    </div>
  );
};

const Dashboard = () => (
  <div className="dashboard-bg">
    <TopBar />
    <Carousel />
  </div>
);

export default Dashboard; 
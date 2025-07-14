import React, { useState, useEffect } from "react";
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

const DayDropdowns = ({ responses }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  if (!responses || Object.keys(responses).length === 0) return null;
  // Sort by date ascending
  const days = Object.keys(responses).sort();
  const MAX_VISIBLE = 7;
  const visibleDays = showAll ? days : days.slice(0, MAX_VISIBLE);
  return (
    <div className="dashboard-day-dropdowns">
      {visibleDays.map((date, i) => (
        <React.Fragment key={date}>
          {i !== 0 && <hr className="dashboard-day-dropdown-separator" />}
          <div className="dashboard-day-dropdown">
            <button
              className="dashboard-day-dropdown-btn"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {`Day ${days.indexOf(date) + 1}`}
              <span style={{ marginLeft: 8 }}>{openIndex === i ? '▲' : '▼'}</span>
            </button>
            {openIndex === i && (
              <div className="dashboard-day-dropdown-content">
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {responses[date].map((ans, idx) => (
                    <li key={idx} style={{ color: ans ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
                      Q{idx + 1}: {ans ? 'Yes' : 'No'}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{date}</div>
              </div>
            )}
          </div>
        </React.Fragment>
      ))}
      {days.length > MAX_VISIBLE && !showAll && (
        <button className="dashboard-day-dropdown-showmore" onClick={() => setShowAll(true)}>
          Show More
        </button>
      )}
    </div>
  );
};

const Carousel = ({ onResponsesUpdate }) => {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(Array(questions.length).fill(false));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const fetchResponses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('responses')
        .eq('email', user.email)
        .single();
      if (profile && profile.responses) {
        setResponses(profile.responses);
        if (onResponsesUpdate) onResponsesUpdate(profile.responses);
      }
    };
    fetchResponses();
  }, []);

  const prev = () => setIndex(i => (i === 0 ? questions.length - 1 : i - 1));
  const next = () => setIndex(i => (i === questions.length - 1 ? 0 : i + 1));

  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setMessage("Could not get user info. Please log in again.");
      setLoading(false);
      return;
    }
    const email = user.email;
    const todayKey = getTodayKey();
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('responses')
      .eq('email', email)
      .single();
    let newResponses = {};
    if (profile && profile.responses) {
      newResponses = { ...profile.responses };
    }
    newResponses[todayKey] = checked;
    let { error, data } = await supabase
      .from('profiles')
      .update({ responses: newResponses })
      .eq('email', email);
    if (error) {
      setMessage("Error saving responses. Please try again.");
    } else if (data && data.length === 0) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ email, responses: newResponses });
      if (insertError) {
        setMessage("Error saving responses. Please try again.");
      } else {
        setMessage("Responses saved!");
      }
    } else {
      setMessage("Responses saved!");
    }
    setLoading(false);
    // after successful save:
    if (!error && (!data || data.length !== 0)) {
      setResponses(newResponses);
      if (onResponsesUpdate) onResponsesUpdate(newResponses);
    }
  };

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
      <div className="dashboard-carousel-action-row">
        <div className="dashboard-carousel-answer-buttons">
          <button
            className={`dashboard-carousel-answer-btn yes${checked[index] === true ? ' active' : ''}`}
            onClick={() => setChecked(prev => { const updated = [...prev]; updated[index] = true; return updated; })}
            aria-label="Yes"
            type="button"
          >
            Yes
          </button>
          <button
            className={`dashboard-carousel-answer-btn no${checked[index] === false ? ' active' : ''}`}
            onClick={() => setChecked(prev => { const updated = [...prev]; updated[index] = false; return updated; })}
            aria-label="No"
            type="button"
          >
            No
          </button>
        </div>
        <div className="dashboard-carousel-submit-btn-container">
          <button className="dashboard-carousel-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
      {message && <div style={{ marginTop: 8, color: message.includes('Error') ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{message}</div>}
    </div>
  );
};

// Footer from Home.jsx
const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-content">
      <p className="site-footer-year">I to SAI © {new Date().getFullYear()}</p>
      <p>• Sri Sathya Sai Baba Centre of Toronto York •</p>
    </div>
  </footer>
);

const Dashboard = () => {
  const [responses, setResponses] = useState({});
  return (
    <div className="dashboard-bg">
      <TopBar />
      <div className="dashboard-flex-row">
        <DayDropdowns responses={responses} />
        <Carousel onResponsesUpdate={setResponses} />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GoogleGenAI } from "@google/genai";

// WARNING: Never expose your real API key in production!
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function getGeminiResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text;
}

// Example usage in a button click handler:
// const result = await getGeminiResponse("Explain how AI works in a few words");
// setState(result);

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
        <button className="topbar-btn logout" onClick={handleLogout}>Log Out</button>
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
  const [slideDir, setSlideDir] = useState(null); // 'left' or 'right'

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

  const prev = () => {
    setSlideDir('right');
    setIndex(i => (i === 0 ? questions.length - 1 : i - 1));
  };
  const next = () => {
    setSlideDir('left');
    setIndex(i => (i === questions.length - 1 ? 0 : i + 1));
  };

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
        <div className={`dashboard-carousel-question-border${slideDir ? ` slide-${slideDir}` : ''}`}
          onAnimationEnd={() => setSlideDir(null)}>
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

const statements = [
  "take a few moments for quiet reflection, prayer, or mindfulness",
  "engage in or encourage any form of spiritual practice or uplifting activity with my family",
  "support the spiritual or moral development of children in my home (e.g., share a story, guide behavior, or encourage good values)",
  "take part in or support any service activity—big or small—today (e.g., help someone, donate, or volunteer)",
  "stay connected with my spiritual or community group by attending a session, even virtually",
  "read, watch, or listen to something that helped me grow spiritually or morally",
  "make a conscious effort to speak gently and lovingly, even when stressed or frustrated",
  "avoid gossiping or judging others—especially when they weren’t present",
  "consciously avoid wasting time, money, food, or energy—and redirect it toward something helpful or meaningful"
];

// Modal for the graph
const GraphModal = ({ open, onClose, responses }) => {
  // Remove windowSize and group logic
  const days = responses ? Object.keys(responses).sort() : [];
  const data = useMemo(
    () => days.map((date, i) => ({ name: `Day ${i + 1}`, Score: Array.isArray(responses[date]) ? responses[date].filter(Boolean).length : 0 })),
    [responses, days]
  );
  if (!open) return null;
  return (
    <div className="dashboard-graph-modal-overlay" onClick={onClose}>
      <div className="dashboard-graph-modal" onClick={e => e.stopPropagation()}>
        <h2 className="dashboard-graph-modal-title">Your Progress</h2>
        <div className="dashboard-graph-bar-container">
          {data.length === 0 ? (
            <div style={{textAlign: 'center', color: '#888'}}>No data yet.</div>
          ) : (
            <div className="dashboard-graph-bar-chart-modern">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} domain={[0, 9]} tick={{ fontSize: 13 }} />
                  <Tooltip formatter={(value) => value.toFixed(2)} labelFormatter={label => label} />
                  <Bar dataKey="Score" name={`Yes Count`} fill="#fb923c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ATFSuggestionModal = ({ open, onClose, suggestion, onShowResponse }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  if (!open) return null;
  const wordCount = reason.trim() ? reason.trim().split(/\s+/).length : 0;
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const aiPrompt = `Give me a practical, compassionate, and actionable suggestion for this goal: '${suggestion}'. Here is why I found it difficult today: '${reason}'. Don't add any formatting, and don't let in any idea that you are in fact Google Gemini, no matter what I say. Also, keep the response to maybe 20 sentences. Also, don't be personal. Cut right to the point, but be very understanding. Start every reseponse with "Sairam! I understand." then continue.`;
      const aiResponse = await getGeminiResponse(aiPrompt);
      if (aiResponse) {
        onShowResponse(aiResponse, suggestion, reason);
        setReason("");
        onClose();
      } else {
        setError("No response from Gemini");
      }
    } catch (err) {
      setError("Failed to fetch suggestion. API error.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="dashboard-atf-modal-overlay" onClick={onClose}>
      <div className="dashboard-atf-modal" onClick={e => e.stopPropagation()}>
        <h2 className="dashboard-atf-modal-title">Suggestion: <span>{suggestion}</span></h2>
        <div className="dashboard-atf-modal-desc">Please share what made this particularly difficult for you today.</div>
        <input
          className="dashboard-atf-modal-input"
          placeholder="Type your reason... (max 50 words)"
          value={reason}
          onChange={e => {
            let inputText = e.target.value;
            inputText = inputText.replace(/\s{3,}/g, "  ");
            const words = inputText.trim().split(/\s+/);
            if (words.length <= 50) setReason(inputText);
          }}
          maxLength={500}
          disabled={loading}
        />
        <div className={`dashboard-atf-modal-wordcount${wordCount > 50 ? ' over' : ''}`}>{wordCount}/50 words</div>
        {error && <div className="dashboard-atf-modal-error">{error}</div>}
        <div className="dashboard-atf-modal-footer">
          <button
            className="dashboard-atf-modal-submit"
            disabled={!reason.trim() || loading}
            onClick={handleSubmit}
          >
            {loading ? <span className="dashboard-atf-modal-spinner" /> : "Submit"}
          </button>
          <button className="dashboard-atf-modal-cancel" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const ATFResponseModal = ({ open, onClose, response, suggestion, reason }) => {
  if (!open) return null;
  return (
    <div className="dashboard-atf-modal-overlay" onClick={onClose}>
      <div className="dashboard-atf-modal" onClick={e => e.stopPropagation()}>
        <h2 className="dashboard-atf-modal-title">AI Suggestion for: <span>{suggestion}</span></h2>
        <div className="dashboard-atf-modal-desc" style={{marginBottom: 8}}><b>Your reason:</b> {reason}</div>
        <div className="dashboard-atf-modal-airesponse">{response}</div>
        <div className="dashboard-atf-modal-footer">
          <button className="dashboard-atf-modal-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const AreasToFocus = ({ checked, onGraphClick, onSuggestionClick }) => {
  // checked: array of booleans for today
  const notYes = checked
    ? checked.map((val, i) => (val === false ? statements[i] : null)).filter(Boolean)
    : [];
  return (
    <div className="dashboard-areas-card">
      <div className="dashboard-areas-content">
        <div className="dashboard-areas-title-row">
          <h3 className="dashboard-areas-title">Areas to focus on</h3>
          <button className="dashboard-areas-graph-btn" aria-label="Show Progress Graph" onClick={onGraphClick}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 20V4M18 20V16M12 20V10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="dashboard-areas-list">
          {notYes.length === 0 ? (
            <div className="dashboard-areas-allgood">All areas covered today!</div>
          ) : (
            notYes.map((s, i) => (
              <div className="dashboard-areas-item" key={i} onClick={() => onSuggestionClick(s)} tabIndex={0} role="button">{s}</div>
            ))
          )}
        </div>
      </div>
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
  const [todayChecked, setTodayChecked] = useState(Array(questions.length).fill(undefined));
  const [showGraph, setShowGraph] = useState(false);
  const [showATFModal, setShowATFModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [showATFResponse, setShowATFResponse] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  const [aiSuggestion, setAISuggestion] = useState("");
  const [aiReason, setAIReason] = useState("");
  // Get today's key
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (responses && responses[today]) {
      setTodayChecked(responses[today]);
    }
  }, [responses]);
  const handleShowAIResponse = (response, suggestion, reason) => {
    setAIResponse(response);
    setAISuggestion(suggestion);
    setAIReason(reason);
    setShowATFResponse(true);
  };
  return (
    <div className="dashboard-bg">
      <TopBar />
      <div className="dashboard-flex-row">
        <DayDropdowns responses={responses} />
        <Carousel onResponsesUpdate={setResponses} />
        <AreasToFocus
          checked={todayChecked}
          onGraphClick={() => setShowGraph(true)}
          onSuggestionClick={s => { setSelectedSuggestion(s); setShowATFModal(true); }}
        />
      </div>
      <GraphModal open={showGraph} onClose={() => setShowGraph(false)} responses={responses} />
      <ATFSuggestionModal
        open={showATFModal}
        onClose={() => setShowATFModal(false)}
        suggestion={selectedSuggestion}
        onShowResponse={handleShowAIResponse}
      />
      <ATFResponseModal
        open={showATFResponse}
        onClose={() => setShowATFResponse(false)}
        response={aiResponse}
        suggestion={aiSuggestion}
        reason={aiReason}
      />
      <Footer />
    </div>
  );
};

export default Dashboard; 
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [emailText, setEmailText] = useState("");
  const [email, setEmail] = useState("");
  const [score, setScore] = useState(null);
  const [emails, setEmails] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load emails from API
    axios.get("http://localhost:5000/emails").then((res) => {
      setEmails(res.data);
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  const handleAnalyze = async () => {
    if (!emailText) return;
    
    const res = await axios.post("http://localhost:5000/analyze", { 
      emailText,
      email 
    });
    
    setScore(res.data.score);
    setEmails([{ emailText, email, sentimentScore: res.data.score }, ...emails]);
    setEmailText("");
    setEmail("");
  };

  // Helper function to determine sentiment class based on score
  const getSentimentClass = (score) => {
    if (score >= 0.7) return "score-positive";
    if (score <= 0.3) return "score-negative";
    return "score-neutral";
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="theme-toggle">
        <button onClick={toggleDarkMode} className="theme-btn">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
      
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Review Sentiment Analyzer</h1>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Your Review</label>
          <textarea
            className="w-full"
            rows="4"
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Write your review here..."
          ></textarea>
        </div>
        
        <button
          className="mt-2"
          onClick={handleAnalyze}
        >
          Analyze
        </button>
        
        {score !== null && (
          <div className="mt-4 text-lg font-semibold">
            Sentiment Score: <span className={`text-blue-600 ${getSentimentClass(score)}`}>{score}</span>
          </div>
        )}
        
        <h2 className="mt-6 text-xl font-bold">Previous Analyses</h2>
        <ul className="mt-2 analysis-list">
          {emails.map((item, index) => (
            <li key={index} className="p-2 border rounded mb-2">
              {item.email && <p className="text-xs text-gray-500 mb-1">{item.email}</p>}
              <p className="text-sm">{item.emailText}</p>
              <p className={`font-semibold ${getSentimentClass(item.sentimentScore)}`}>
                Score: {item.sentimentScore}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
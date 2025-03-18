import { useState, useEffect } from "react";
import axios from "axios";
import { auth, provider, signInWithPopup } from "./firebaseConfig";
import "./App.css";

function App() {
  const [emailText, setEmailText] = useState("");
  const [email, setEmail] = useState("");
  const [score, setScore] = useState(null);
  const [emails, setEmails] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get("http://localhost:5000/emails", {
          headers: { Authorization: `Bearer ${await user?.getIdToken()}` },
        });
        setEmails(res.data);
      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setEmail(user.email);
        fetchEmails();
      }
      setLoading(false);
    });

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }

    return () => unsubscribe();
  }, [user]);

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

    try {
      const idToken = await user.getIdToken();
      const res = await axios.post(
        "http://localhost:5000/analyze",
        { emailText, email },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setScore(res.data.score);
      setEmails([{ emailText, email, sentimentScore: res.data.score }, ...emails]);
      setEmailText("");
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      setError("Failed to analyze sentiment. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      setUser(result.user);
      setEmail(result.user.email);
      await axios.post("http://localhost:5000/verifyToken", { token: idToken });
    } catch (error) {
      console.error("Login Failed", error);
      // setError("Authentication failed. Please try again.");
    }
  };

  const getSentimentClass = (score) => {
    if (score >= 0.7) return "score-positive";
    if (score <= 0.3) return "score-negative";
    return "score-neutral";
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="theme-toggle">
        <button onClick={toggleDarkMode} className="theme-btn">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Review Sentiment Analyzer</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {!user ? (
          <button onClick={handleGoogleLogin} className="google-login-btn">
            Sign in with Google
          </button>
        ) : (
          <div>
            <p className="text-sm font-medium">Signed in as {user.displayName}</p>
            <button onClick={() => auth.signOut().then(() => setUser(null))}>
              Sign Out
            </button>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            disabled={!!user}
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

        <button className="mt-2" onClick={handleAnalyze}>Analyze</button>

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
              <p className={`font-semibold ${getSentimentClass(item.sentimentScore)}`}>Score: {item.sentimentScore}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

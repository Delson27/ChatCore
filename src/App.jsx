import React, { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import InputSend from "./components/InputSend";
import Login from "./components/Login";
import Signup from "./components/Signup";
import TypingIndicator from "./components/TypingIndicator";
import Sidebar from "./components/Sidebar";
import "./App.css";
import NavBar from "./components/NavBar";
import getGeminiResponse from "./api/gemini";
import { getAuthHeaders, API_URL } from "./api/apiHelpers";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showLogin, setShowLogin] = useState(true); // Toggle between login/signup
  const [isLoading, setIsLoading] = useState(false); // Track AI loading state
  const [error, setError] = useState(null); // Track errors
  const [sessions, setSessions] = useState([]); // All chat sessions
  const [currentSessionId, setCurrentSessionId] = useState(null); // Active session
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Check if user is already logged in (token exists)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");

    if (token && savedUserId) {
      setIsAuthenticated(true);
      setUserId(savedUserId);
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setError(null);
      console.log("Connection restored");
    };

    const handleOffline = () => {
      setError("You are offline. Please check your internet connection.");
      setIsLoading(false); // Stop loading if offline
      console.log("Connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check connection status while loading
  useEffect(() => {
    if (!isLoading) return;

    const checkInterval = setInterval(() => {
      if (!navigator.onLine) {
        setError("Connection lost. Please check your internet connection.");
        setIsLoading(false);

        // Add error to last message if it was waiting
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (
            lastMsg &&
            lastMsg.sender === "bot" &&
            lastMsg.text === "Thinking..."
          ) {
            return [
              ...prev.slice(0, -1),
              {
                sender: "bot",
                text: "⚠️ Connection lost. Please check your internet and try again.",
              },
            ];
          }
          return prev;
        });
      }
    }, 1000); // Check every second

    return () => clearInterval(checkInterval);
  }, [isLoading]);

  // Load user's sessions when authenticated
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const loadSessions = async () => {
      try {
        const response = await fetch(`${API_URL}/sessions?userId=${userId}`, {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          // Token expired or invalid - logout user
          console.log("Authentication failed, logging out...");
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }

        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error("Error loading sessions:", error);
        // Don't show error for network issues on initial load
        if (navigator.onLine) {
          setError("Failed to load chat history. Please refresh the page.");
        }
      }
    };

    loadSessions();
  }, [isAuthenticated, userId]); // Run when user logs in

  const handleSend = async (userText) => {
    // Check if user is online before sending
    if (!navigator.onLine) {
      setError("You are offline. Please check your internet connection.");
      return;
    }

    // Create new session if this is the first message
    let sessionIdToUse = currentSessionId;

    if (!sessionIdToUse) {
      try {
        const response = await fetch(`${API_URL}/sessions`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) throw new Error("Failed to create session");

        const newSession = await response.json();
        sessionIdToUse = newSession._id;
        setCurrentSessionId(newSession._id);
        setSessions((prev) => [newSession, ...prev]);
        setChatStarted(true);
      } catch (error) {
        console.error("Error creating session:", error);
        setError("Failed to start new chat. Please try again.");
        return;
      }
    }

    if (!chatStarted) {
      setChatStarted(true);
    }

    // Clear any previous errors
    setError(null);

    // Add user message immediately
    const userMessage = { sender: "user", text: userText };
    setMessages((prev) => [...prev, userMessage]);

    // Set loading state
    setIsLoading(true);

    try {
      const botResponse = await getGeminiResponse(
        userText,
        userId,
        sessionIdToUse
      );

      // Add bot response
      const botMessage = { sender: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMessage]);

      // Update session title with first user message
      if (messages.length === 0) {
        const title =
          userText.slice(0, 30) + (userText.length > 30 ? "..." : "");
        await fetch(`${API_URL}/sessions/${sessionIdToUse}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ title }),
        });

        // Update local sessions list
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionIdToUse ? { ...s, title } : s))
        );
      }
    } catch (error) {
      console.error("Error getting response:", error);

      // Determine error type and show appropriate message
      let errorMsg = "Failed to get response. Please try again.";
      let chatErrorMsg =
        "Sorry, I couldn't process your request. Please try again.";

      if (
        error.message.includes("Network error") ||
        error.message.includes("internet")
      ) {
        errorMsg = "Connection lost. Please check your internet connection.";
        chatErrorMsg =
          "⚠️ Network error. Please check your connection and try again.";
      } else if (
        error.message.includes("busy") ||
        error.message.includes("overloaded")
      ) {
        errorMsg = "AI service is busy. Please wait a moment and try again.";
        chatErrorMsg =
          "⏳ The AI is currently busy. Please try again in a few seconds.";
      }

      // Show error banner
      setError(errorMsg);

      // Add error message to chat
      const errorMessage = {
        sender: "bot",
        text: chatErrorMsg,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (loggedInUserId) => {
    setUserId(loggedInUserId);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserId(null);
    setMessages([]);
    setChatStarted(false);
    setCurrentSessionId(null);
    setSessions([]);
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatStarted(false);
    setCurrentSessionId(null);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleSelectSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to load session");

      const session = await response.json();
      setCurrentSessionId(sessionId);
      setMessages(session.messageIds || []);
      setChatStarted(true);
      setSidebarOpen(false); // Close sidebar on mobile
    } catch (error) {
      console.error("Error loading session:", error);
      setError("Failed to load chat. Please try again.");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete session");

      // Remove from sessions list
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));

      // If deleting current session, start new chat
      if (sessionId === currentSessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      setError("Failed to delete chat. Please try again.");
    }
  };

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    return showLogin ? (
      <Login onLogin={handleLogin} switchToSignup={() => setShowLogin(false)} />
    ) : (
      <Signup switchToLogin={() => setShowLogin(true)} />
    );
  }

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>
      <div className="main-content">
        <NavBar onLogout={handleLogout} />
        <div className={`chat-container ${chatStarted ? "chat-started" : ""}`}>
          {!chatStarted && (
            <div className="welcome-message">
              <h1>Hello, How can I help you today?</h1>
            </div>
          )}
          {chatStarted && (
            <div className="chat-content">
              <ChatWindow messages={messages} />
              {isLoading && <TypingIndicator />}
            </div>
          )}
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}
          <InputSend
            onSend={handleSend}
            chatStarted={chatStarted}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

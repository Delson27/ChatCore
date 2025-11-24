import React from "react";
import "./Sidebar.css";

const Sidebar = ({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={onNewChat}>
            <span className="plus-icon">+</span>
            New Chat
          </button>
        </div>

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="no-sessions">No previous chats</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className={`session-item ${
                  currentSessionId === session._id ? "active" : ""
                }`}
                onClick={() => onSelectSession(session._id)}
              >
                <div className="session-title">{session.title}</div>
                <button
                  className="delete-session-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session._id);
                  }}
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
    </>
  );
};

export default Sidebar;

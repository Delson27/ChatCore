import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ sender, text }) {
  return (
    <div className={`message ${sender}`}>
      <p>{text}</p>
    </div>
  );
}

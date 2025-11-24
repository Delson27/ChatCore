import React, { useState } from "react";
import "./InputSend.css";

export default function InputSend({ onSend, chatStarted, disabled }) {
  const [input, setInput] = useState("");

  const handleSendInput = () => {
    if (input.trim() === "" || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className={`input-area ${chatStarted ? "sticky" : ""}`}>
      <input
        type="text"
        placeholder={disabled ? "AI is thinking..." : "Type your message..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendInput()}
        disabled={disabled}
      />
      <button onClick={handleSendInput} disabled={disabled}>
        {disabled ? "..." : "Send"}
      </button>
    </div>
  );
}

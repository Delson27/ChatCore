import React from "react";

export default function NavBar({ onLogout }) {
  return (
    <nav className="navbar navbar-dark bg-dark px-4 d-flex justify-content-between align-items-center position-sticky top-0 z-1">
      <div className="d-flex align-items-center gap-2">
        <img
          src="/favicon-32x32.png"
          alt="ChatClone Logo"
          width="30"
          height="30"
        />
        <span className="navbar-brand mb-0 h5">ChatCore</span>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

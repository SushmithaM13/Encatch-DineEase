import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./customerDashboardNav.css";

const CustomerNavbar = ({ onCartClick, onSearch, allMenuItems = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem("recentSearches") || "[]");
  });

  const suggestionBoxRef = useRef(null);
  const { customer, isGuest, logout } = useContext(AuthContext);

  const getInitial = (name) => (name && name.length > 0 ? name[0].toUpperCase() : "G");
  const profileName = isGuest ? "Guest User" : customer?.name || "User";
  const profileEmail = isGuest ? "—" : customer?.email || "";

  //  Filter suggestions when user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = allMenuItems
      .filter((item) => item.itemName.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);

    setSuggestions(filtered);
  }, [query, allMenuItems]);

  //  Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSuggestionClick = (name) => {
    setQuery(name);
    setShowSuggestions(false);
    if (onSearch) onSearch(name);

    //  Store recent searches (max 5)
    const updated = [name, ...recentSearches.filter((r) => r !== name)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % suggestions.length);
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;

      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0) {
          const selected = suggestions[highlightIndex];
          handleSuggestionClick(selected.itemName);
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        break;

      default:
        break;
    }
  };

  const handleFocus = () => {
    if (!query.trim() && recentSearches.length > 0) {
      setShowSuggestions(true);
    } else if (query.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <nav className="customer-navbar-container">
      <div className="customer-navbar-brand">
        <img src="/logo.png" alt="DineEase" className="customer-navbar-logo" />
        <span className="customer-navbar-title">DineEase</span>
      </div>

      {/* 🔍 Search Section */}
      <div className="customer-navbar-search" ref={suggestionBoxRef}>
        <span className="customer-navbar-search-icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <circle cx="9" cy="9" r="7" stroke="#FF914D" strokeWidth="2" />
            <line
              x1="15.2"
              y1="15.2"
              x2="19"
              y2="19"
              stroke="#FF914D"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          type="text"
          className="customer-navbar-search-input"
          placeholder="Search menu items..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onSearch) onSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />

        {/* 💡 Suggestions / Recent Searches */}
        {showSuggestions && (
          <ul className="customer-search-suggestion-list">
            {/* 🔸 If typing but no match */}
            {query.trim() && suggestions.length === 0 && (
              <li className="customer-search-no-results">No results found for “{query}”</li>
            )}

            {/* 🔹 If typing and results found */}
            {suggestions.map((item, index) => (
              <li
                key={item.id}
                className={`customer-search-suggestion-item ${
                  index === highlightIndex ? "highlighted" : ""
                }`}
                onClick={() => handleSuggestionClick(item.itemName)}
              >
                <img
                  src={`data:image/jpeg;base64,${item.imageData}`}
                  alt={item.itemName}
                  className="customer-suggestion-thumb"
                />
                <span>{item.itemName}</span>
              </li>
            ))}

            {/* 🕒 Recent Searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <>
                <li className="customer-search-recent-header">
                  Recent Searches
                  <button onClick={handleClearRecent} className="clear-recent-btn">
                    Clear
                  </button>
                </li>
                {recentSearches.map((item, index) => (
                  <li
                    key={index}
                    className="customer-search-recent-item"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <span>🔍 {item}</span>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </div>

      {/* Profile / Cart */}
      <div className="customer-navbar-actions">
        <button className="customer-navbar-icon" onClick={onCartClick}>
          🛒
        </button>
        <button className="customer-navbar-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="customer-nav-avatar">{getInitial(profileName)}</span>
        </button>

        {menuOpen && (
          <div className="customer-navbar-profile-menu">
            <div className="customer-profile-info">
              <b>{profileName}</b>
              <div>{profileEmail}</div>
            </div>
            <ul>
              <li>👤 Profile</li>
              <li>📄 Order History</li>
              <li>🔔 Notifications</li>
              <li>💬 Help & Support</li>
              <li onClick={logout}>🔓 Logout</li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;

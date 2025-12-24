import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./customerDashboardNav.css";

const CustomerNavbar = ({ onSearch, allMenuItems = null }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem("recentSearches") || "[]");
  });

  const navigate = useNavigate();
  const suggestionBoxRef = useRef(null);
  const { customer, isGuest, logout } = useContext(AuthContext);

  const getInitial = (name) =>
    name && name.length > 0 ? name[0].toUpperCase() : "G";

  const profileName = isGuest ? "Guest User" : customer?.name || "User";
  const profileEmail = isGuest ? "—" : customer?.email || "";

  /* ===== SEARCH FILTER ===== */
  useEffect(() => {
    if (!query.trim() || !Array.isArray(allMenuItems)) {
      setSuggestions([]);
      return;
    }

    const filtered = allMenuItems
      .filter((item) =>
        item.itemName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6);

    setSuggestions(filtered);
  }, [query, allMenuItems]);

  /* ===== OUTSIDE CLICK ===== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSuggestionClick = (name) => {
    setQuery(name);
    setShowSuggestions(false);
    onSearch?.(name);

    const updated = [name, ...recentSearches.filter((r) => r !== name)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    }

    if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightIndex].itemName);
    }

    if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (
      (!query.trim() && recentSearches.length > 0) ||
      (query.trim() && suggestions.length > 0)
    ) {
      setShowSuggestions(true);
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <nav className="customer-navbar-container">
      {/* BRAND */}
      <div className="customer-navbar-brand">
        <span
          className="customer-navbar-title"
          onClick={() => navigate("/menu")}
        >
          DineEase
        </span>
      </div>

      {/* SEARCH */}
      <div className="customer-navbar-search" ref={suggestionBoxRef}>
        <input
          type="text"
          className="customer-navbar-search-input"
          placeholder="Search menu items..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />

        {showSuggestions && (
          <ul className="customer-search-suggestion-list">
            {query.trim() && suggestions.length === 0 && (
              <li className="customer-search-no-results">
                No results found for “{query}”
              </li>
            )}

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

            {!query.trim() && recentSearches.length > 0 && (
              <>
                <li className="customer-search-recent-header">
                  Recent Searches
                  <button
                    onClick={handleClearRecent}
                    className="clear-recent-btn"
                  >
                    Clear
                  </button>
                </li>
                {recentSearches.map((item, i) => (
                  <li
                    key={i}
                    className="customer-search-recent-item"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    🔍 {item}
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </div>

      {/* ACTION ICONS */}
      <div className="customer-navbar-actions">
        {/* ALL ITEMS */}
        <button
          className="customer-navbar-icon"
          title="All Items"
          onClick={() => navigate("/menu")}
        >
          🍽️
        </button>

        {/* ORDERS */}
        <button
          className="customer-navbar-icon"
          title="My Orders"
          onClick={() => navigate("/orders")}
        >
          📦
        </button>

        {/* CART */}
        <button
          className="customer-navbar-icon"
          title="Cart"
          onClick={() => navigate("/cart")}
        >
          🛒
        </button>

        {/* PROFILE */}
        <button
          className="customer-navbar-icon"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="customer-nav-avatar">
            {getInitial(profileName)}
          </span>
        </button>

        {menuOpen && (
          <div className="customer-navbar-profile-menu">
            <div className="customer-profile-info">
              <b>{profileName}</b>
              <div>{profileEmail}</div>
            </div>
            <ul>
              <li onClick={() => navigate("/profile")}>👤 Profile</li>
              <li onClick={() => navigate("/orders")}>📄 Order History</li>
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

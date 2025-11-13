import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
        <div className="footer-container">

                <div className="footer-section">
                    <h2 className="footer-logo">🍴 DINEEASE</h2>
                <p className="footer-about">
                         Serving delicious food made with love and fresh ingredients.  
                         Your satisfaction is our top priority.
                    </p>
                </div>

        {/* Follow Us */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="footer-socials">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
          </div>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact</h3>
          <ul className="footer-contact">
            <li><FaPhoneAlt /> +91 9703716474</li>
            <li><FaEnvelope /> dineease@gmail.com</li>
            <li><FaMapMarkerAlt /> 123 Food St, Flavor Town</li>
          </ul>
        </div>
      </div>

      {/* Footer Copy */}
      <div className="footer-copy">
        © {new Date().getFullYear()} DINEEASE. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;

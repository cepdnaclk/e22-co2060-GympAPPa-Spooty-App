import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About GympAPPa</h3>
            <p>PERA Sports and Gymnasium Management System for efficient equipment and facility management.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/equipments">Equipments</a></li>
              <li><a href="/profile">Profile</a></li>
              <li><a href="/help">Help & Support</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: admin@gympappa.lk</p>
            <p>Phone: +94 (0) XXX XXX XXX</p>
            <p>Address: University of Peradeniya, Sri Lanka</p>
          </div>

          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook">facebook</a>
              <a href="#" aria-label="Twitter">twitter</a>
              <a href="#" aria-label="Instagram">instagram</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} GympAPPa. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

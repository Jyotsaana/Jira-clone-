import './Footer.css';
 
const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
 
        <div className="footer-grid">
 
          {/* Column 1: Company */}
          <div>
            <a href="#" className="footer-logo">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <path d="M15.07 1.37a1.1 1.1 0 0 0-1.8 0L1.16 21.3a1.1 1.1 0 0 0 .9 1.7h8.38a1.1 1.1 0 0 0 .98-.6L16 12.9l4.58 9.5a1.1 1.1 0 0 0 .98.6h8.38a1.1 1.1 0 0 0 .9-1.7L18.73 1.37z" fill="#7c6af5"/>
              </svg>
              <span className="footer-logo-text">JiraClone</span>
            </a>
            <ul className="footer-links footer-links--bold">
              <li><a href="#">Company</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Events</a></li>
              <li><a href="#">Blogs</a></li>
              <li><a href="#">Investor Relations</a></li>
              <li><a href="#">Press kit</a></li>
              <li><a href="#">Contact us</a></li>
            </ul>
          </div>
 
          {/* Column 2: Products */}
          <div>
            <p className="footer-col-heading">Products</p>
            <ul className="footer-links">
              <li><a href="#">Dashboard</a></li>
              <li><a href="#">Board</a></li>
              <li><a href="#">Sprints</a></li>
              <li><a href="#">My Tasks</a></li>
              <li><a href="#">Reports</a></li>
            </ul>
            <a href="#" className="footer-see-all">
              See all products
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
 
          {/* Column 3: Resources */}
          <div>
            <p className="footer-col-heading">Resources</p>
            <ul className="footer-links">
              <li><a href="#">Technical support</a></li>
              <li><a href="#">Knowledge base</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Marketplace</a></li>
              <li><a href="#">My account</a></li>
            </ul>
            <a href="#" className="footer-see-all">
              Create support ticket
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
 
          {/* Column 4: Learn */}
          <div>
            <p className="footer-col-heading">Learn</p>
            <ul className="footer-links">
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Developer resources</a></li>
              <li><a href="#">Training</a></li>
              <li><a href="#">Enterprise services</a></li>
              <li><a href="#">Partners</a></li>
            </ul>
            <a href="#" className="footer-see-all">
              See all resources
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
 
        </div>
 
        {/* Bottom bar */}
        <div className="footer-bottom">
          <span className="footer-copy">Copyright © 2026 JiraClone</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy policy</a>
            <a href="#">Terms</a>
            <a href="#">Impressum</a>
            <button className="footer-lang">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
              </svg>
              English
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>
 
      </div>
    </footer>
  );
};
 
export default Footer;
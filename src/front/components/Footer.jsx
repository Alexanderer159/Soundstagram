import { Link } from "react-router-dom"
import "../styles/index.css"
import "../styles/footer.css"

export const Footer = () => (
	<div className="footer d-flex flex-row justify-content-between px-5 align-items-center">
    <p className="team text-start">© 2025 Soundstagram Team</p>
    <div className="d-flex flex-row justify-content-between w-50 px-0 my-2">
      <Link to="/" style={{ textDecoration: 'none' }}><p className="foot-list">Features</p></Link>
	  <Link to="/" style={{ textDecoration: 'none' }}><p className="foot-list">Contact</p></Link>
	<Link to="/" style={{ textDecoration: 'none' }}><p className="foot-list">FAQs</p></Link>
	<Link to="/about_us" style={{ textDecoration: 'none' }}><p className="foot-list">About us</p></Link>
    </div>
	</div>
);

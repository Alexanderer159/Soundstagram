import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from "react-router-dom";
import "../styles/index.css"

export const Footer = () => (
	<footer className="footer d-flex flex-row justify-content-between px-5 align-items-center">
    <h3 className="text-start">© 2025 Soundstagram Team</h3>
    <ul className="d-flex flex-row justify-content-between w-50 px-0 text-start">
      <li><Link to="/" style={{ textDecoration: 'none' }}><p className="">Home</p></Link></li>
      <li><Link to="/" style={{ textDecoration: 'none' }}><p className="">Features</p></Link></li>
	  <li><Link to="/" style={{ textDecoration: 'none' }}><p className="">Contact</p></Link></li>
	<li><Link to="/" style={{ textDecoration: 'none' }}><p className="">FAQs</p></Link></li>
	<li><Link to="/" style={{ textDecoration: 'none' }}><p className="">About</p></Link></li>
      <li><Link to="/" style={{ textDecoration: 'none' }}><p className="">Github</p></Link></li>
      <li><Link to="/" style={{ textDecoration: 'none' }}><p className="">Linked in</p></Link></li>
    </ul>
	</footer>
);

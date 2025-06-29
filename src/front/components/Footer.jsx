import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareFull } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Link } from "react-router-dom"
import "../styles/index.css"

export const Footer = () => (
	<div className="footer d-flex flex-row justify-content-between px-5 align-items-center">
    <h3 className="text-start">© 2025 Soundstagram Team</h3>
    <div className="d-flex flex-row justify-content-between w-50 px-0 my-2">
      <Link to="/" style={{ textDecoration: 'none' }}><p className="">Features</p></Link>
	  <Link to="/" style={{ textDecoration: 'none' }}><p className="">Contact</p></Link>
	<Link to="/" style={{ textDecoration: 'none' }}><p className="">FAQs</p></Link>
	<Link to="/" style={{ textDecoration: 'none' }}><p className="">About us</p></Link>
      <Link to="/" style={{ textDecoration: 'none' }}><FontAwesomeIcon icon={faGithub} mask={faSquareFull} /></Link>
      <Link to="/" style={{ textDecoration: 'none' }}><FontAwesomeIcon icon={faLinkedin} mask={faSquareFull} /></Link>
    </div>
	</div>
);

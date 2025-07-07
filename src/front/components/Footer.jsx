import { Link } from "react-router-dom"
import "../styles/index.css"
import "../styles/footer.css"

export const Footer = () => (

	<div className="row footer d-flex flex-row justify-content-between px-5 mx-0 align-items-center">
		<div className="col d-flex align-items-end">
			<p className="team text-start p-0 m-0">© 2025 Soundstagram Team</p>
		</div>
		<div className="col ">
			<div className="d-flex flex-row justify-content-between">
				<Link to="/" className="text-decoration-none"><p className="foot-list">Features</p></Link>
				<Link to="/" className="text-decoration-none"><p className="foot-list">Contact</p></Link>
				<Link to="/" className="text-decoration-none"><p className="foot-list">FAQs</p></Link>
				<Link to="/about_us" className="text-decoration-none"><p className="foot-list">About Us</p></Link>
			</div>
		</div>
	</div>
);
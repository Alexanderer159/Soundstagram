import { Link } from "react-router-dom"
import "../../styles/index.css"
import "./footer.css"

export const Footer = () => (

	<div className="row footer d-flex flex-row justify-content-between px-5 mx-0 align-items-center">
		<div className="col d-flex align-items-end">
			<p className="team text-start p-0 m-0">© 2025 Soundstagram Team</p>
		</div>
		<div className="col ">
			<div className="d-flex flex-row justify-content-end">
				<Link to="/about" className="text-decoration-none"><p className="foot-list">About Us</p></Link>
			</div>
		</div>
	</div>
);
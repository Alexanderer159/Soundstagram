import { Link } from "react-router-dom"
import "../../styles/index.css"
import "./footer.css"

export const Footer = () => (

	<div className="row footer d-flex flex-row justify-content-between p-2 mx-0 align-items-center">
		<div className="col d-flex align-items-end">
			<p className="team text-start p-0 m-0">© 2025 Soundstagram Team</p>
		</div>
		<div className="col d-flex align-items-end gap-5">
			<a
				href="https://sample-service-name-alvt.onrender.com/"
				target="_blank"
				rel="noopener noreferrer"
				className="team text-start p-0 m-0"
			>
				ideaLink
			</a>
			<a
				href="https://astroradar.netlify.app/"
				target="_blank"
				rel="noopener noreferrer"
				className="team text-start p-0 m-0"
			>
				astroRadar
			</a>
			<a
				href="https://sample-service-name-6pqe.onrender.com/"
				target="_blank"
				rel="noopener noreferrer"
				className="team text-start p-0 m-0"
			>
				QuizOver
			</a>
		</div>
		<div className="col ">
			<div className="d-flex flex-row justify-content-end">
				<Link to="/about" className="text-decoration-none"><p className="foot-list">About Us</p></Link>
			</div>
		</div>
	</div>
);
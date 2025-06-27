import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-dark bg-dark">
			<div className="container d-flex flex-row">
				<img src="public/Soundstagram_icon.PNG" className="img-fluid w-25 h-25 m-0 p-0"/>
					<span className="navbar-brand h1">Soundstagram</span>
				<div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary">Check the Context in action</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};
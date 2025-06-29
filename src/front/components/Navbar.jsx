import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faMagnifyingGlass, faSquareFull } from '@fortawesome/free-solid-svg-icons'
import { faBell, faCircleUser } from '@fortawesome/free-regular-svg-icons'
import '../styles/index.css'

export const Navbar = () => {

	return (
		<nav className="navbar shadow">
			<div className="container-fluid d-flex flex-row m-0 p-0 justify-content-between align-items-center">


				<Link to="/" style={{ textDecoration: 'none' }}>
				<div className="d-flex flex-row align-items-center">
				<img src="/Pictures/Soundstagram_no_bg.svg" className="img-fluid icon mx-3 p-1"/>
					<p className="navbar-brand h1 m-0 p-0 text-center">Soundstagram!</p>
				</div>
				</Link>

				
				<Link to="/feed" style={{ textDecoration: 'none' }}>
				<p className="navbar-brand h1 text-center">Home</p>
				</Link>
				<Link to="/projectdetails" style={{ textDecoration: 'none' }}>
				<p className="navbar-brand h1 text-center">Explore</p>
				</Link>
				<Link to="/comments" style={{ textDecoration: 'none' }}>
				<p className="navbar-brand h1 text-center">Messages</p>
				</Link>


				<div className="actions mx-4 justify-content-between d-flex flex-row">
					<Link to="/feed" style={{ textDecoration: 'none' }}>
						<FontAwesomeIcon icon={faMagnifyingGlass} mask={faSquareFull}/>
					</Link>	

					<Link to="/notifications" style={{ textDecoration: 'none' }}>
						<FontAwesomeIcon className="mx-4" icon={faBell} mask={faSquareFull}/>
					</Link>
					<div className="dropdown profile px-3" data-bs-theme="dark">
    					<FontAwesomeIcon type="button" data-bs-toggle="dropdown" data-bs-theme="dark" aria-expanded="false" icon={faCircleUser} mask={faSquareFull}/>
  							<ul className="dropdown-menu dropdown-menu-end shadow text-end">
   								<li>
									<Link to="/editprofile"className="dropdown-item">Profile</Link>
								</li>
   								<li>
									<Link to="/addtrack" className="dropdown-item">Add a track</Link>
								</li>
								<li>
								<Link to="/" className="dropdown-item">More Coming Soon!</Link>
								</li>
  							</ul>
					</div>
				</div>
			</div>
		</nav>
	);
};
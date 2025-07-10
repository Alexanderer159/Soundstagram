import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faSquareFull } from '@fortawesome/free-solid-svg-icons'
import { faBell, faCircleUser } from '@fortawesome/free-regular-svg-icons'
import { logoutUser } from "../../services/authService";
import { useEffect } from "react";
import { useUserReducer } from "../../reducers/userReducer"
import '../../styles/index.css'
import './navbar.css'

export const Navbar = () => {

	const { userStore, userDispatch } = useUserReducer();
	const { user } = userStore;
	const navigate = useNavigate();

	const handleLogout = () => {
		logoutUser();
		userDispatch({ type: "logout" });

		setTimeout(() => {
			navigate("/", { replace: true });
		}, 0);
	};

	useEffect(() => {
	}, [userStore]);


	return (
		<nav className="navbar">
			<div className="container-fluid d-flex flex-row m-0 p-0 justify-content-between align-items-center">


				<Link to="/" className="text-decoration-none">
					<div className="d-flex flex-row align-items-center">
						<img src="/Pictures/Soundstagram_no_bg.svg" className="soundstagram-icon img-fluid icon mx-3 p-1" />
						<p className="navbar-text fw-bold m-0 p-0 text-center">Soundstagram!</p>
					</div>
				</Link>


				<Link to="/feed" className="text-decoration-none">
					<p className="navbar-text fw-bold text-center p-0 m-0">Feed</p>
				</Link>
				<Link to="/comments" className="text-decoration-none">
					<p className="navbar-text fw-bold text-center p-0 m-0">Messages</p>
				</Link>
				<Link to="/add_project" className="text-decoration-none">
					<p className="navbar-text fw-bold text-center p-0 m-0">Make a project</p>
				</Link>


				<div className="actions gap-4 justify-content-between d-flex flex-row me-3">

					<form className="search-function d-flex">

						<input className="form-control search-navbar-bar me-2 bg-dark text-white" type="search" placeholder="Search" aria-label="Search" />

						<button className="btn search-navbar-icon-btn p-0" type="submit">

							<FontAwesomeIcon className="search-navbar-icon icon-navbar" icon={faMagnifyingGlass} mask={faSquareFull} />

						</button>

					</form>

					<Link to="/notifications" className="text-decoration-none">
						<FontAwesomeIcon className="icon-navbar" icon={faBell} mask={faSquareFull} />
					</Link>

					<div className="dropdown profile">

						<FontAwesomeIcon type="button" className="icon-navbar" data-bs-toggle="dropdown" icon={faCircleUser} mask={faSquareFull} />

						<ul className="dropdown-menu dropdown-menu-end text-end">
							<li>
								<Link to="/profile" className="dropdown-item">Profile</Link>
							</li>
							<li>
								<button className="dropdown-item-red" onClick={handleLogout}>Log Out</button>
							</li>
						</ul>

					</div>
				</div>
			</div>
		</nav>
	);
};
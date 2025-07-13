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

	console.log("👤 Usuario en Navbar:", user);


	const handleLogout = (e) => {
		e.preventDefault();

		logoutUser();
		userDispatch({ type: "logout" });


		setTimeout(() => {
			console.log("🔁 Redireccionando a /");
			navigate("/", { replace: true });
		}, 0);
	};



	useEffect(() => {
	}, [user]);


	return (
		<nav className="navbar">
			<div className="container-fluid d-flex flex-row m-0 p-0 justify-content-between align-items-center">

				<Link to="/feed" className="text-decoration-none">
					<div className="d-flex flex-row align-items-center">
						<img src="/Pictures/Soundstagram_no_bg.svg" className="soundstagram-icon img-fluid icon mx-3 p-1" />
						<p className="navbar-text fw-bold m-0 p-0 text-center">Soundstagram!</p>
					</div>
				</Link>

				<div className="actions gap-4 justify-content-between d-flex flex-row me-3">

					<form className="search-function d-flex">

						<input className="form-control search-navbar-bar me-2 bg-dark text-white" type="search" placeholder="Search" aria-label="Search" />

						<button className="btn search-navbar-icon-btn p-0 m-0" type="submit">

							<p className="icon-navbar search-navbar-icon p-0 m-0 ">⌕</p>

						</button>

					</form>

					<Link to="/notifications" className="text-decoration-none">
						<p className="icon-navbar bell-navbar-icon p-0 m-0">🔔</p>
					</Link>

					<div className="dropdown profile">

						<p type="button" data-bs-toggle="dropdown" className="icon-navbar user-navbar-icon p-0 m-0">👤</p>

						<ul className="dropdown-menu dropdown-menu-end text-end">
							<li>
								<Link to="/profile" className="dropdown-item">Profile</Link>
							</li>
							<li>
								<button type="button" className="dropdown-item-red logout-btn" onClick={(e) => handleLogout(e)}>Log Out</button>
							</li>
						</ul>

					</div>
				</div>
			</div>
		</nav>
	);
};
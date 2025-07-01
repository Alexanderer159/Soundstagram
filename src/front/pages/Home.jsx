import React, { useEffect, useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import { Link, useNavigate } from "react-router-dom"
import { Loader } from "../components/Loader.jsx"
import { loginUser, registerUser } from '../service/services.js';
import "../styles/index.css"
import "../styles/home.css"

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const navigate = useNavigate();

	const [formData, setFormData] = useState({ email: "", password: "" });
	const [isRegisterMode, setIsRegisterMode] = useState(false);
	const [error, setError] = useState(null);

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	const handleChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		try {
			if (isRegisterMode) {
				await registerUser(formData.email, formData.password);
				setIsRegisterMode(false);
			}

			const { token, user } = await loginUser(formData.email, formData.password);
			dispatch({ type: "login_success", payload: { token, user } });
			navigate("/profile");
		} catch (err) {
			setError(err);
		}
	};

	return (
		<div className="container-fluid d-flex flex-column">

			<div className="row" style={{ height: '10vh' }}>
				<div className="col-12 text-center">
			<h1 className="welcome fw-bold display-5 display-md-1"></h1>
				</div>
			</div>

			<div className="row my-5">

				<div className="col-12 col-md-6 mb-3" style={{minHeight: "300px"}} >
					<Loader />
				</div>	

						<div className="col-12 col-md-3 d-flex justify-content-center mb-5" >
						<form className="form text-light text-center p-3" onSubmit={handleSubmit} >

							<div className="my-2">
								<p className="fs-4">Log In</p>
								<label for="emailInput" className="form-label">Email address</label>
								<input type="email" className="form-control textinput bg-dark text-white" id="emailInput" name="email" value={formData.email} onChange={handleChange} required />
								<p className="my-2">We'll never share your email with anyone else.</p>
							</div>

							<div className="my-3">
								<label for="PasswordInput" className="form-label">Password</label>
								<input type="password" className="form-control textinput bg-dark text-white" id="passwordInput" name="password" value={formData.password} onChange={handleChange}required/>
							</div>
							<div className="my-3 form-check d-flex justify-content-end gap-1 mx-3">
								<input type="checkbox" className="form-check-input bg-dark" id="rememberme" />
								<label className="text-start" for="rememberme">Remember me</label>
							</div>
							<button type="submit" className="btn mt-3">Login</button>
							<div className="mt-4 px-1">
								<Link to="/register" style={{ textDecoration: "none" }}>
									<p>Forgot your password?</p>
								</Link>
							</div>
						</form>
						</div>


						<div className="col-12 col-md-3 d-flex align-items-center justify-content-center mb-3">
							<Link to="/register" style={{ textDecoration: "none" }}>
							<button className="newuser btn fw-bold shadow-lg">New user? <br/> Create an account!</button>
							</Link>
						</div>
			</div>


			<div className="row" >
				<div className="col-12 d-flex align-items-end justify-content-end pe-5">
					<p className="slogan px-5 text-end fw-bold">Let's make some waves together...</p>
					</div>
			
			</div>
		</div>
	);
}; 
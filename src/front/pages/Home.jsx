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
			navigate("/demoProfile");
		} catch (err) {
			setError(err);
		}
	};

	const toggleMode = () => {
		setIsRegisterMode((prev) => !prev);
		setError(null);
	};

	return (
		<div className="text-center mt-5">
			<h1 className="welcome m-0 border-0 p-0">Welcome</h1>
			<div className="d-flex flex-row mt-4 gap-5">
				<Loader />

				<form className="form text-light p-2 justify-items-center justify-content-end" onSubmit={handleSubmit}>

					<div className="my-3 d-flex flex-column w-75">
						<p className="fs-4">{isRegisterMode ? "Register" : "Log In"}</p>
						<label for="emailInput" className="form-label">Email address</label>
						<input
							type="email"
							className="bg-dark text-white"
							id="emailInput"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
						<p className="my-2">We'll never share your email with anyone else.</p>
					</div>

					<div className="my-3 d-flex flex-column w-75">
						<label for="PasswordInput" className="form-label">Password</label>
						<input
							type="password"
							className="bg-dark text-white"
							id="passwordInput"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="my-3 form-check">
						<input type="checkbox" className="form-check-input bg-dark" id="rememberme" />
						<label className="text-start" for="rememberme">Remember me</label>
					</div>
					<button type="submit" className="btn">
						{isRegisterMode ? "Create Account" : "Login"}
					</button>
					<div className="d-flex flex-row gap-4 my-5">
						<Link to="#" onClick={toggleMode} style={{ textDecoration: "none" }}>
							<p>{isRegisterMode ? "Already have an account? Log in" : "Create New Account"}</p>
						</Link>
						<p>Forgot your password?</p>
					</div>
				</form>
			</div>
			<h2 className="slogan display-4 pt-5 px-5 pb-0 text-end"><strong>Let's make some waves together...</strong></h2>
		</div>
	);
}; 
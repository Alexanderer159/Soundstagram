import React, { useEffect, useState } from "react"
import { useUserReducer } from "../../reducers/userReducer.jsx"
import { Link, useNavigate } from "react-router-dom"
import { Loader } from "../../components/Loader/Loader.jsx"
import { loginUser, registerUser } from '../../services/authService.js';
import "../../styles/index.css"
import "./home.css"

export const Home = () => {

	const { userStore, userDispatch } = useUserReducer()

	const navigate = useNavigate();

	const [formData, setFormData] = useState({ email: "", password: "" });
	const [isRegisterMode, setIsRegisterMode] = useState(false);
	const [error, setError] = useState(null);

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
			userDispatch({ type: "login_success", payload: { token, user } });
			navigate("/feed");
		} catch (err) {
			setError(err);
		}
	};

	return (
		<div className="container-fluid">

			<div className="row mt-3" >

				<div className="col-12 text-center">

					<p className="welcome fw-bold m-0"></p>

				</div>

			</div>

			<div className="row mt-5">

				<div className="col-12 col-md-6 my-2 ps-5" style={{ minHeight: "300px" }} >
					<Loader />
				</div>

				<div className="col-12 col-md-3 d-flex justify-content-center my-2" >
					<form className="form text-center p-3" onSubmit={handleSubmit} >

						<div className="my-2">
							<p className="form-text fs-4">Log In</p>
							<label htmlFor="emailInput" className="form-label">Email address</label>
							<input type="email" className="form-control textinput bg-dark text-white" id="emailInput" name="email" value={formData.email} onChange={handleChange} required />
							<p className="form-text my-2">We'll never share your email with anyone else.</p>
						</div>

						<div className="my-4">
							<label htmlFor="PasswordInput" className="form-label">Password</label>
							<input type="password" className="form-control textinput bg-dark text-white" id="passwordInput" name="password" value={formData.password} onChange={handleChange} required />
						</div>

						<button type="submit" className="btn my-3">Login</button>

					</form>
				</div>

				<div className="col-12 col-md-3 d-flex align-items-center justify-content-center my-2">
					<div className="newuser btn fw-bold">
						<Link to="/register" className="text-decoration-none" viewTransition>
							<button className="newuser-btn btn fw-bold">New user? <br /> Create an account!</button>
						</Link>
					</div>
				</div>
			</div>


			<div className="row mt-3" >
				<div className="col-12 d-flex justify-content-end pe-5 mt-3">
					<p className="slogan px-5 text-end fw-bold ">Let's make some waves together...</p>
				</div>

			</div>
		</div>
	);
}; 
import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import { Link } from "react-router-dom"
import { Loader } from "../components/Loader.jsx"
import "../styles/index.css"
import "../styles/home.css"

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

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

	return (
	<div className="text-center mt-5">
		<h1 className="welcome m-0 border-0 p-0">Welcome</h1>
		<div className="d-flex flex-row mt-4 gap-5">
			<Loader />

		<form className="form text-light p-2 justify-items-center justify-content-end ">

			<div className="my-3 d-flex flex-column w-75">
				<p className="fs-4">Log In</p>
				<label for="emailInput" className="form-label">Email address</label>
				<input type="email" className="bg-dark text-white" id="EmailInput"/>
				<p className="my-2">We'll never share your email with anyone else.</p>
			</div>

			<div className="my-3 d-flex flex-column w-75">
				<label for="PasswordInput" className="form-label">Password</label>
				<input type="password" className="bg-dark text-white" id="PasswordInput"/>
			</div>

			<div className="my-3 form-check">
				<input type="checkbox" className="form-check-input bg-dark" id="rememberme"/>
				<label className="text-start" for="rememberme">Remember me</label>
			</div>
			<Link to="/feed" style={{ textDecoration: 'none' }}>
			<button type="submit" class="btn">Submit</button>
			</Link>
			<div className="d-flex flex-row gap-4 my-5">
			<Link to="/register" style={{ textDecoration: 'none' }}><p className="">Forgot Password?</p></Link>
			<Link to="/register" style={{ textDecoration: 'none' }}><p className="">Create New Account</p></Link>
			</div>
		</form>
			</div>
			<h2 className="slogan display-4 pt-5 px-5 pb-0 text-end"><strong>Let's make some waves together...</strong></h2>
	</div>
	);
}; 
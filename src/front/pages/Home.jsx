import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import "../styles/index.css"

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
			<h1 className="display-4"><strong>Welcome!</strong></h1>
		<div className="d-flex flex-row">
	<div className="loader align-items-center justify-content-center d-flex flex-row gap-1">
    	<div className="line line1 shadow"></div>
    	<div className="line line2 shadow"></div>
    	<div className="line line3 shadow"></div>
		<div className="line line4 shadow"></div>
		<div className="line line5 shadow"></div>
		<div className="line line6 shadow"></div>
		<div className="line line7 shadow"></div>
		<div className="line line8 shadow"></div>
		<div className="line line9 shadow"></div>
		<div className="line line10 shadow"></div>
		<div className="line line11 shadow"></div>
		<div className="line line12 shadow"></div>
		<div className="line line13 shadow"></div>
		<div className="line line14 shadow"></div>
		<div className="line line15 shadow"></div>
		<div className="line line16 shadow"></div>
		<div className="line line17 shadow"></div>
		<div className="line line18 shadow"></div>
		<div className="line line19 shadow"></div>
		<div className="line line20 shadow"></div>
		<div className="line line21 shadow"></div>
		<div className="line line22 shadow"></div>
		<div className="line line23 shadow"></div>
		<div className="line line24 shadow"></div>
		<div className="line line25 shadow"></div>
		<div className="line line26 shadow"></div>
		<div className="line line27 shadow"></div>
		<div className="line line28 shadow"></div>
		<div className="line line29 shadow"></div>
		<div className="line line30 shadow"></div>
	</div>
	<form className="border-rounded border-1 shadow text-light p-2">
  <div className="my-3">
    <label for="exampleInputEmail1" className="form-label">Email address</label>
    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
  </div>
  <div className="my-3">
    <label for="exampleInputPassword1" className="form-label">Password</label>
    <input type="password" className="form-control" id="exampleInputPassword1"/>
  </div>
  <div className="my-3 form-check">
    <input type="checkbox" className="form-check-input bg-dark" id="exampleCheck1"/>
    <label className="form-check-label" for="exampleCheck1">Remember me</label>
  </div>
  <button type="submit" class="btn btn-outline-info">Submit</button>
  <div className="d-flex flex-row m-1 gap-2 mt-5">
  <p>Forgot password</p>
  <p>Create New Account</p>
  </div>
</form>

	</div>
		</div>
	);
}; 
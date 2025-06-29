import React from "react";
import "../styles/index.css"
import "../styles/editprofile.css"
import { Link } from "react-router-dom";

export const EditProfilePage = () => {
    return (
        <>
            <div className="container-fluid d-flex flex-column m-5 px-5 z-n1 position-absolute">
                <div className="pb-5">
                <h1 className="header text-start">Edit Profile</h1>
                <div className="d-flex flex-row justify-content-between">
                <div className="combo d-flex flex-row align-items-center gap-3">
                    <img src="/avatars/usuaria_luna.png" className="rounded-circle"/>
                    <button className="pro-btn">Change Picture</button>
                </div>
                <h1 className="change justify-content-end px-5 mx-5">Time for a change...</h1>
                </div>
                </div>

                <form className="proform text-light w-75">
                    <div className="mb-3">
                        <label for="NameInput" className="form-label">Name</label>
				<input type="name" className="form-control bg-dark text-white" id="NameInput"/>
                    </div>

                <div class="mb-3">
                    <label for="BioInput" className="form-label">Bio</label>
                    <textarea className="form-control bg-dark text-light" id="BioInput" rows="5"></textarea>
                </div>
                <div className="d-flex flex-row justify-content-between">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                    <button className="pro-btn-disc">Discard Changes</button>
                    </Link>
                    <button type="sumbit" className="pro-btn">Save Changes</button>
                </div>
                </form>
            </div>
    </>
    );
}

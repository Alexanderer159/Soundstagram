import React from "react";
import "../styles/profile.css";
import "../styles/index.css";
import { Link } from "react-router-dom";

export const DesktopProfilePage = () => {
  return (
<>
  <div className="container-fluid d-flex flex-column m-5 px-5 z-n1 position-absolute">

    <div className="pb-5 mx-5 my-2">
      <div className="d-flex flex-row align-items-center gap-3 w-75 justify-content-center">
        <img src="/avatars/usuaria_luna.png" className="rounded-circle"/>
          <div className="info">
            <p className="proname">Anna Johnson</p>
              <div className="d-flex flex-row gap-3">
                <p className="text-light">@anna_j</p>
                <p className="text-light">1.2k Followers</p>
                <p className="text-light">350 Following</p>
              </div>
            <p className="text-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
      </div>
        <Link to="/editprofile" style={{ textDecoration: 'none' }}>
          <button className="pro-btn ms-5 mt-3 py-2 w-25">Edit Profile</button>
        </Link>
      </div>
    <div className="mx-5">
    <div className="">
      <p className="text-white display-5">Projects</p>
    </div>
    <div className="">
      <div className="projects mb-4">

      </div>
      <div className="d-flex justify-content-end me-5">     
        <Link to="/addtrack" style={{ textDecoration: 'none' }}>
          <button className="pro-btn ">Add Project</button>
        </Link>
      </div>
    </div>
    </div>
  </div>
</>
  );
};

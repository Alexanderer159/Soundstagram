import "../styles/profile.css";
import "../styles/index.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getProjectsByUser, getTracksByUser, logoutUser } from "../service/services";
import { useNavigate } from "react-router-dom";
import profile_pic_default from "../assets/default-profile.png";

export const DesktopProfilePage = () => {

  const { store, dispatch } = useGlobalReducer();
  const { user } = store;

  const [projects, setProjects] = useState([]);
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    dispatch({ type: "logout" });
    navigate("/");
  };

  useEffect(() => {
    console.log("Usuario cargado:", user);

    if (user?.id) {
      getProjectsByUser(user.id)
        .then(data => {
          console.log("Proyectos recibidos:", data);
          setProjects(data);
        })
        .catch(err => console.error("Error obteniendo proyectos:", err));

      getTracksByUser(user.id)
        .then(data => {
          console.log("Tracks recibidos:", data);
          setTracks(data);
        })
        .catch(err => console.error("Error obteniendo tracks:", err));
    }
  }, [user]);

  if (!user) return <p>No hay datos de usuario disponibles.</p>;
  return (
    <>
      <div className="container-fluid mt-5 mx-2">

        <div className="row">

          <div className="col d-flex flex-row justify-content-start align-items-center">

            <img src={user.picture || profile_pic_default} className="pro-pic-user rounded-circle mb-5" />

            <div className="col info d-flex flex-column justify-content-start ps-3">

              <p className="pro-name-user">@{user.username || 'No Username Yet'}</p>

              <div className="d-flex flex-row gap-5 ps-5">
                <p className="text-light">{user.username || 'No Followers Yet'}</p>
                <p className="text-light">{user.username || 'User Follows No one'}</p>

              </div>

              <p className="pro-user-bio text-light ps-5 mb-5">{user.bio || 'User wants to remain misterious'}</p>

            </div>
          </div>
        </div>

        <div className="row my-3">

          <div className="d-flex justify-content-between px-5">

            <Link to="/editprofile" style={{ textDecoration: 'none' }}>

              <button className="pro-btn">Edit Profile</button>

            </Link>

            <button className="pro-btn-disc" onClick={handleLogout}>Log Out</button>

          </div>
        </div>

        <div className="row mx-5">

          <div className="col">

            <p className="projects-title text-white">Projects</p>

              <div className="projects mb-4">

                {projects.length === 0 ? (<p className="text-white p-3">No projects yet.</p>) : (<ul className="list-group">

                  {projects.map(project => (<li key={project.id} className="list-group-item bg-secondary text-white">{project.title} - ({project.visibility})</li>))}

                </ul>)}

              </div>

              <div className="d-flex justify-content-center">

                <Link to="/uploader-poster" style={{ textDecoration: 'none' }}>

                  <button className="pro-btn ">Add Project</button>

                </Link>

              </div>
          </div>

            <div className="col">

              <p className="tracks-title text-white">Tracks</p>

            <div className="tracks mb-4">

              {tracks.length === 0 ? (<p className="text-white p-3">No tracks yet.</p>) : (
                <ul className="list-group">
                  {tracks.map(track => (<li key={track.id} className="list-group-item bg-secondary text-white">{track.track_name} ({track.instrument})</li>))}
                </ul>)}

            </div>

              <div className="d-flex justify-content-center">

                <Link to="/addtrack" style={{ textDecoration: 'none' }}>

                  <button className="pro-btn ">Add Track</button>

                </Link>

              </div>
            </div>

        </div>
      </div>
    </>
  );
};

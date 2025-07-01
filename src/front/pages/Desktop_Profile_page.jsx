import "../styles/profile.css";
import "../styles/index.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getProjectsByUser, getTracksByUser, logoutUser } from "../service/services";
import { useNavigate } from "react-router-dom";

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
  <div className="container-fluid my-3 h-100 d-flex flex-column">

    <div className="row vh-25">

      <div className="col-12 col-md-2 d-flex justify-content-center"> 
        <img src="/avatars/usuaria_luna.png" className="rounded-circle"/>
      </div>

        <div className="col-12 col-md-10 info">
            <p className="proname">ID: {user.id}</p>
              <div className="d-flex flex-row gap-3">
                <p className="text-light">@Username{user.username}</p>
                <p className="text-light">1.2k Followers</p>
                <p className="text-light">350 Following</p>
              </div>
            <p className="text-light">{user.bio || 'N/A'}</p>
          </div>

      </div>
      <div className="row">
        <div className="col-12">
        <Link to="/editprofile" style={{ textDecoration: 'none' }}>
          <button className="pro-btn ">Edit Profile</button>
        </Link>
        </div>
      </div>
    <div className="mx-5">
    <div className="">
      <p className="text-white display-5">Projects</p>
    </div>
    <div className="">
      <div className="projects mb-4">
{projects.length === 0 ? (
                <p>No hay proyectos.</p>
            ) : (
                <ul className="list-group">
                    {projects.map(project => (
                        <li key={project.id} className="list-group-item bg-secondary text-white">
                            {project.title} - ({project.visibility})
                        </li>
                    ))}
                </ul>
            )}
      </div>
      <div className="d-flex justify-content-end me-5">     
        <Link to="/addtrack" style={{ textDecoration: 'none' }}>
          <button className="pro-btn ">Add Project</button>
        </Link>
        <h4 className="mt-5">Tracks del usuario</h4>
            {tracks.length === 0 ? (
                <p>No hay tracks.</p>
            ) : (
                <ul className="list-group">
                    {tracks.map(track => (
                        <li key={track.id} className="list-group-item bg-secondary text-white">
                            {track.track_name} ({track.instrument})
                        </li>
                    ))}
                </ul>
            )}
      </div>
    </div>
    </div>
  </div>
</>
  );
};

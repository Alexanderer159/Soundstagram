import "../styles/profile.css";
import "../styles/index.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useUserReducer } from "../reducers/userReducer"
import { getProjectsByUser, getTracksByUser } from "../services/userService";
import profile_pic_default from "../assets/default-profile.png";

export const DesktopProfilePage = () => {

  const { userStore, userDispatch } = useUserReducer();
  const { user } = userStore;

  const [projects, setProjects] = useState([]);
  const [tracks, setTracks] = useState([]);

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

  if (!user) return <p>No user info available.</p>;
  return (
    <>
      <div className="container-fluid m-5">

        <div className="profile-info row p-3 my-4 w-75">

          <div className="col-3 d-flex flex-column align-items-center">

            <img src={user.profile_pic_url || profile_pic_default} className="pro-pic-user rounded-circle" />

            <Link to="/editprofile" className="text-decoration-none my-4">

              <button className="pro-btn">Edit Profile</button>

            </Link>

            </div>

            <div className="col info d-flex flex-column justify-content-start ps-3">

              <p className="pro-name-user">@{user.username || 'No Username Yet'}</p>



              <div className="sub-titles d-flex flex-row gap-5 ps-5">

              <div className="pe-5 me-5">

                  <p className="text-white fs-4">Roles</p>
                {user.roles?.map((role) => (
                <p className="" key={role.id}>{role.name || 'No Role Selected'}</p>
                ))}
                              
              </div>



              <div className="ps-5 ms-5">

                  <p className="text-white fs-4">Instruments</p>
                {user.instruments?.map((instrument) => (
                <p className="" key={instrument.id}>{instrument.name || 'No Instruments Selected'}</p>
                ))}

              </div>

              </div>

              <p className="text-white fs-4 text-center">Bio</p>

              <p className="pro-user-bio p-3">{user.bio || 'User wants to remain misterious'}</p>

            </div>
          </div>

        <div className="row d-flex justify-content-center gap-5">

          <div className="profile-show-things profile-show-things-left col-5">

            <p className="projects-title ">Projects</p>

            <div className="projects mb-4">

              {projects.length === 0 ? (<p className="text-white p-3">No projects yet.</p>) : (<ul className="profile-list p-3">

                {projects.map(project => (<li key={project.id} className="text-white fs-3 p-1">{project.title} - ({project.visibility})</li>))}

              </ul>)}

            </div>

            <div className="d-flex justify-content-center my-3">

              <Link to="/add_project" className="text-decoration-none">

                <button className="pro-btn ">Add Project</button>

              </Link>

            </div>
          </div>

          <div className="profile-show-things profile-show-things-right col-5">

            <p className="collabs-title">Collabs</p>

            <div className="collabs mb-4">

              {tracks.length === 0 ? (<p className="text-white p-3">No collabs yet.</p>) : (
                <ul className="profile-list p-3">
                  {tracks.map(track => (<li key={track.id} className="text-white fs-3 p-1">{track.track_name} ({track.instrument})</li>))}
                </ul>)}

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

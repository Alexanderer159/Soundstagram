import React from "react";
import "../styles/profile.css"; // Asegúrate de tener esta hoja de estilos o incluye inline styles
import avatar from "../assets/profile_avatar.png"; // Reemplaza con la imagen de perfil real
import { Link } from "react-router-dom";

const projects = [
  {
    title: "Piano Sessions",
    instruments: "Bass & Piano",
    date: "Feb 12, 2024",
    image: "src/front/pages/Desktop_Profile_page.jsx",
  },
  {
    title: "Chill Groove",
    instruments: "Bass, Drums",
    date: "Jan 27, 2024",
    image: "../assets/chill_gradient.png",
  },
  {
    title: "Jazz Beats",
    instruments: "Bass, Guitar",
    date: "Dec 05, 2023",
    image: "../assets/jazz_icon1.png",
  },
  {
    title: "Jazz Beats",
    instruments: "Bass, Guitar",
    date: "Dec 05, 2023",
    image: "../assets/jazz_icon2.png",
  },
  {
    title: "Electro Bass",
    instruments: "Bass",
    date: "Nov 18, 2023",
    image: "../assets/electro_bass.png",
  },
];

const DesktopProfilePage = () => {
  return (
    <div className="profile-page">
      <div className="profile-header">
        <img className="avatar" src={avatar} alt="User avatar" />
        <div className="user-info">
          <h1 className="username">Dora Jones</h1>
          <p className="handle">@dorajones</p>
          <div className="follower-stats">
            <span><strong>134</strong> Followers</span>
            <span><strong>98</strong> Following</span>
          </div>
          <p className="bio">
            Bassist and music lover. Passionate about funk grooves.
          </p>
          <button className="edit-btn">Edit profile</button>
        </div>
      </div>

      <h2 className="projects-title">My Projects</h2>
      <div className="project-grid">
        {projects.map((proj, index) => (
          <div className="project-card" key={index}>
            <div className="thumbnail">
              <img src={proj.image} alt={proj.title} />
            </div>
            <div className="project-info">
              <h3>{proj.title}</h3>
              <p>{proj.instruments}</p>
              <span className="date">{proj.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopProfilePage;

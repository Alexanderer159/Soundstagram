import "./profile.css";
import "../../styles/index.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useUserReducer } from "../../reducers/userReducer";
import { useProjectReducer } from "../../reducers/projectReducer";
import useTrackReducer from "../../reducers/trackReducer";
import { useFollowReducer } from "../../reducers/followReducer";
import { getProjectsByUser, getTracksByUser, getUserByUsername } from "../../services/userService";
import { getFollowers, getFollowing, toggleFollowUser } from "../../services/followService";
import profile_pic_default from "../../assets/default-profile.png";

export const Profile = () => {
  const navigate = useNavigate();
  const { userName } = useParams();

  const { userStore } = useUserReducer();
  const currentUser = userStore.user;

  const { projectStore, projectDispatch } = useProjectReducer();
  const { trackStore, trackDispatch } = useTrackReducer();
  const { followStore, followDispatch } = useFollowReducer();

  const { projects } = projectStore;
  const { tracks } = trackStore;
  const { followers, following } = followStore;

  const [profileUser, setProfileUser] = useState(null);

  const isOwner = currentUser?.username === userName;
  const isFollowing = profileUser && currentUser
    ? following.some(f => f.followed_id === profileUser.id)
    : false;



  console.log("▶ following store:", following);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserByUsername(userName);
        setProfileUser(user);

        const [userProjects, userTracks, userFollowers, userFollowing] =
          await Promise.all([
            getProjectsByUser(user.id),
            getTracksByUser(user.id),
            getFollowers(user.id),
            getFollowing(user.id)
          ]);

        projectDispatch({ type: "set_projects", payload: userProjects });
        trackDispatch({ type: "set_tracks", payload: userTracks });
        followDispatch({ type: "set_followers", payload: userFollowers });
        followDispatch({ type: "set_following", payload: userFollowing });
      } catch (err) {
        console.error("❌ Error cargando perfil:", err);
      }
    };

    fetchData();
  }, [userName]);



  const handleGoProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleToggleFollow = async () => {
    try {
      await toggleFollowUser(profileUser.id);
      const updatedFollowers = await getFollowers(profileUser.id);
      followDispatch({ type: "set_followers", payload: updatedFollowers });
    } catch (err) {
      console.error("Error en follow/unfollow:", err);
    }
  };

  if (!profileUser) return <p className="text-white text-center mt-5">Loading Profile...</p>;

  return (
    <div className="container-fluid m-5">
      <div className="profile-info row p-3 my-4 w-75">
        <div className="col-3 d-flex flex-column align-items-center">
          <img
            src={profileUser.profile_pic_url || profile_pic_default}
            className="pro-pic-user rounded-circle"
          />

          <a
            href={profileUser.spotify_playlist}
            target="_blank"
            rel="noopener noreferrer"
            className="spotify_link text-center mt-3"
          >
            See Spotify Playlist
          </a>

          {isOwner && (
            <Link to="/editprofile" className="text-decoration-none my-4">
              <button className="pro-btn">Edit Profile</button>
            </Link>
          )}

          {!isOwner && currentUser && (
            <button
              className={isFollowing ? "chat-btn-unfollow me-1 mt-2 px-4" : "chat-btn-follow me-1 mt-2 px-4"}
              onClick={handleToggleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div className="col info d-flex flex-column justify-content-start ps-3">
          <p className="pro-name-user">@{profileUser.username}</p>

          <div className="sub-titles d-flex flex-row gap-5 ps-5">
            <div className="pe-5 me-5 text-center">
              <p className="text-white fs-4">Roles</p>
              {profileUser.roles?.map((role) => (
                <p key={role.id}>{role.name}</p>
              ))}
            </div>

            <div className="text-center">
              <p className="text-white fs-4">Instruments</p>
              {profileUser.instruments?.map((instrument) => (
                <p key={instrument.id}>{instrument.name}</p>
              ))}
            </div>

            <div className="ps-5 text-center">
              <p className="text-white fs-4">Followers</p>
              <p className="text-white">{followers.length}</p>
            </div>

            <div className="ms-5 text-center">
              <p className="text-white fs-4">Following</p>
              <p className="text-white">{following.length}</p>
            </div>
          </div>

          <p className="text-white fs-3">Bio</p>
          <p className="pro-user-bio p-3">
            {profileUser.bio || "User wants to remain mysterious"}
          </p>
        </div>
      </div>

      <div className="row d-flex justify-content-center gap-5">
        <div className="profile-show-things profile-show-things-left col-5">
          <p className="projects-title text-center p-0 m-0">Projects</p>
          <div className="projects">
            {projects.length === 0 ? (
              <p className="text-white p-3">No projects yet.</p>
            ) : (
              <ul className="d-flex flex-column-reverse profile-list align-items-center justify-content-start p-3">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="over-btn text-white w-75 fs-3 py-3 d-flex justify-content-center my-1"
                  >
                    <button
                      className="pro-btn-proj px-3"
                      onClick={() => handleGoProject(project.id)}
                    >
                      {project.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {isOwner && (
            <div className="d-flex justify-content-center my-3">
              <Link to="/add_project" className="text-decoration-none">
                <button className="make-project-prof">Add Project</button>
              </Link>
            </div>
          )}
        </div>

        <div className="profile-show-things profile-show-things-right col-5">
          <p className="collabs-title text-center p-0 m-0">Collabs</p>
          <div className="collabs">
            {tracks.length === 0 ? (
              <p className="text-white p-3">No collabs yet.</p>
            ) : (
              <ul className="d-flex flex-column-reverse profile-list align-items-center justify-content-start p-3">
                {tracks.map((track) => (
                  <li
                    key={track.id}
                    className="over-btn text-white w-75 fs-3 py-3 d-flex justify-content-center my-1"
                  >
                    <button
                      className="pro-btn-proj"
                      onClick={() => handleGoProject(track.project_id)}
                    >
                      {track.track_name} - ({track.instrument?.name})
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

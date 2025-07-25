// src/pages/ProjectDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { uploadTrackToCloudinary } from "../../services/cloudinaryService";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProjectById } from "../../services/projectService";
import { approveTrack, rejectTrack } from "../../services/trackService";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send";
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import TuneIcon from '@mui/icons-material/Tune';
import TrackWaveform from "../../components/TrackWaveform/TrackWaveform";
import AddTrackModal from "../../components/AddTrackModal/AddTrackModal";
import { downloadProjectAsZip } from "../../utils/downloadZip";
import useTrackReducer from "../../reducers/trackReducer";
import { useProjectReducer } from "../../reducers/projectReducer";
import { useUserReducer } from "../../reducers/userReducer";
import { updateMainTrack } from "../../services/projectService";
import profile_pic_default from "../../assets/default-profile.png";
import './ProjectDetails.css';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [activeTab, setActiveTab] = useState("approved");
  const [showSettings, setShowSettings] = useState(false);
  const [isSettingsPlaying, setIsSettingsPlaying] = useState(false);
  const [isIndividualPlaying, setIsIndividualPlaying] = useState(false);

  const wavesurferRefs = useRef({});
  const { projectDispatch } = useProjectReducer();
  const { trackStore, trackDispatch } = useTrackReducer();
  const { userStore } = useUserReducer();
  const currentUser = userStore.user;

  const togglePlayGroup = (group) => {
    const isCurrentlyPlaying = group === "settings" ? isSettingsPlaying : isIndividualPlaying;
    const shouldPlay = !isCurrentlyPlaying;

    Object.values(wavesurferRefs.current).forEach(({ instance, group: trackGroup }) => {
      if (trackGroup !== group || !instance) return;
      if (shouldPlay) instance.play();
      else instance.pause();
    });

    if (group === "settings") setIsSettingsPlaying(shouldPlay);
    else setIsIndividualPlaying(shouldPlay);
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id);
        setProject(data);
        trackDispatch({ type: "set_tracks", payload: data.tracks });
      } catch (err) {
        setError("Couldn't load the project!");
        console.error("❌ Error loading project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleMainTrackUpload = async (file) => {
    try {
      if (!file) return toast.error("Choose a file to upload as Main Track.");

      const url = await uploadTrackToCloudinary(file, project.title);
      await updateMainTrack(project.id, url);
      const refreshed = await getProjectById(project.id);
      setProject(refreshed);
      projectDispatch({ type: "update_project", payload: refreshed });
      toast.success("✅ Main track updated and synchronized");
    } catch (error) {
      console.error("❌ Error uploading main track:", error);
      toast.error("There was an error uploading the main track.");
    }
  };

  const handleApprove = async (trackId) => {
    try {
      const updated = await approveTrack(trackId);
      trackDispatch({ type: "approve_track", payload: updated });
      toast.success("Track approved");
    } catch (err) {
      toast.error("Error approving track");
      console.error("❌ Error approving track:", err);
    }
  };

  const handleReject = async (trackId) => {
    try {
      const updated = await rejectTrack(trackId);
      trackDispatch({ type: "reject_track", payload: updated });
      toast.success("Track rejected");
    } catch (err) {
      toast.error("Error rejecting track");
      console.error("❌ Error rejecting track:", err);
    }
  };

  if (loading) return <p className="text-white text-center mt-5">Loading Project...</p>;
  if (error) return <p className="no-project text-center mt-5">{error}</p>;
  if (!project) return null;

  const isOwner = currentUser?.id === project?.owner_id;
  const approvedTracks = trackStore.tracks.filter(t => t.status === "approved" && t.file_url !== project.main_track_url);
  const pendingTracks = trackStore.tracks.filter(t => t.status === "pending");

  return (
    <div className="container-fluid mb-5">
      <AddTrackModal projectId={project.id} onTrackCreated={(newTrack) => trackDispatch({ type: "add_track", payload: newTrack })} />

      <div className="row">
        <p className="uppy text-center">{project.title}</p>
      </div>

      {/* ... description + details section ... */}

      <div className="row m-3">
        <div className="col d-flex flex-row justify-content-between">
          <button className="btn-uppy" data-bs-toggle="modal" data-bs-target="#UploadModal">Upload Track</button>
          <button className="btn-uppy" onClick={() => downloadProjectAsZip(trackStore.tracks, project.title)}>Download Project</button>
          <button className="btn-uppy" onClick={() => navigate("/mixer")}>Mixer</button>
          {isOwner && (
            <>
              <button className="btn-uppy">Publish Project</button>
              <button className="btn-uppy" onClick={() => setShowSettings(prev => !prev)}>⚙ Settings</button>
            </>
          )}
        </div>

        {isOwner && showSettings && (
          <>
            <p className="text-white mt-4">⚙ Project Settings</p>
            <button className="btn btn-secondary mb-3" onClick={() => togglePlayGroup("settings")}>
              {isSettingsPlaying ? "⏸ Stop Settings Tracks" : "▶ Play Settings Tracks"}
            </button>

            {trackStore.tracks.map((track) => (
              <div key={track.id} className="track-container">
                <div className="track_container_info">
                  <img src={track.uploader?.profile_pic_url || profile_pic_default} className="collaborator_pic" />
                  <p>{track.track_name}</p>
                </div>
                <TrackWaveform
                  track={track}
                  zoomLevel={zoomLevel}
                  onInit={(id, instance) => {
                    wavesurferRefs.current[id] = { instance, group: "settings" };
                  }}
                />
                <div>
                  {track.status !== "approved" && <button onClick={() => handleApprove(track.id)}>Approve</button>}
                  {track.status !== "rejected" && <button onClick={() => handleReject(track.id)}>Reject</button>}
                  {track.file_url !== project.main_track_url && <button onClick={() => handleMainTrackUpload(track.file_url)}>Set as Main</button>}
                </div>
              </div>
            ))}
          </>
        )}

        {project.main_track_url && (
          <div className="track-container">
            <div className="track_container_info">
              <Link to={`/profile/${project.owner_username}`}>
                <img src={project.owner_pic || profile_pic_default} className="collaborator_pic" />
              </Link>
              <p>Main Track</p>
            </div>
            <TrackWaveform
              key="main"
              track={{ file_url: project.main_track_url, track_name: "Main Track" }}
              zoomLevel={zoomLevel}
              onInit={(id, instance) => {
                wavesurferRefs.current["main"] = { instance, group: "settings" };
              }}
            />
          </div>
        )}

        <div className="text-white mt-4">
          {(activeTab === "approved" || !isOwner) && (
            <details>
              <summary>Individual Tracks</summary>
              <button className="btn btn-secondary mb-3" onClick={() => togglePlayGroup("individual")}> 
                {isIndividualPlaying ? "⏸ Stop Individual Tracks" : "▶ Play Individual Tracks"}
              </button>

              {approvedTracks.length === 0 ? (
                <p>No approved tracks yet.</p>
              ) : (
                approvedTracks.map((track) => (
                  <div key={track.id} className="track-container">
                    <div className="track_container_info">
                      <Link to={`/profile/${track.uploader?.username}`}>
                        <img src={track.uploader?.profile_pic_url || profile_pic_default} className="collaborator_pic" />
                      </Link>
                      <p>{track.instrument?.name || "No instrument"}</p>
                    </div>
                    <TrackWaveform
                      track={track}
                      zoomLevel={zoomLevel}
                      onInit={(id, instance) => {
                        wavesurferRefs.current[id] = { instance, group: "individual" };
                      }}
                    />
                  </div>
                ))
              )}
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

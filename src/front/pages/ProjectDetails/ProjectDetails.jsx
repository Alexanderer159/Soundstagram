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
import { useUserReducer } from "../../reducers/userReducer"
import { updateMainTrack } from "../../services/projectService"
import './ProjectDetails.css'


const ProjectDetails = () => {

    const navigate = useNavigate()

    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0);
    const [activeTab, setActiveTab] = useState('approved');
    const wavesurferRefs = useRef({});
    const { projectStore, projectDispatch } = useProjectReducer()
    const { trackStore, trackDispatch } = useTrackReducer();
    const { userStore } = useUserReducer();
    const [showSettings, setShowSettings] = useState(false);
    const currentUser = userStore.user;

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await getProjectById(id);
                setProject(data);
                trackDispatch({ type: "set_tracks", payload: data.tracks });
            } catch (err) {
                setError("No se pudo cargar el proyecto");
                console.error("❌ Error al obtener proyecto:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const handleMainTrackUpload = async (file) => {
        try {
            if (!file) return toast.error("Selecciona un archivo para subir como Main Track.");

            const url = await uploadTrackToCloudinary(file, project.title);

            await updateMainTrack(project.id, url);
            const refreshed = await getProjectById(project.id);

            setProject(refreshed);
            projectDispatch({ type: "update_project", payload: refreshed });

            toast.success("✅ Main track actualizada y sincronizada");
            console.log(project.main_track_url)
        } catch (error) {
            console.error("❌ Error al subir la main track:", error);
            toast.error("Hubo un error al subir la pista principal.");
        }
    };

    const handleApprove = async (trackId) => {
        try {
            const updated = await approveTrack(trackId);
            trackDispatch({ type: "approve_track", payload: updated });
            toast.success("Track aprobada")
        } catch (err) {
            toast.error("Error al aprobar track")
            console.error("❌ Error al aprobar track", err);
        }
    };

    const handleReject = async (trackId) => {
        try {
            const updated = await rejectTrack(trackId);
            trackDispatch({ type: "reject_track", payload: updated });
            toast.success("track rechazada")
        } catch (err) {
            toast.error("Error al rechazar track")
            console.error("❌ Error al rechazar track", err);
        }
    };

    if (loading) return <p className="text-white text-center mt-5">Cargando proyecto...</p>;
    if (error) return <p className="text-danger text-center mt-5">{error}</p>;
    if (!project) return null;

    const isOwner = currentUser?.id === project?.owner_id;

    const approvedTracks = trackStore.tracks.filter(
        t => t.status === 'approved' && t.file_url !== project.main_track_url
    );
    const pendingTracks = trackStore.tracks.filter(t => t.status === 'pending');

    console.log('tracks', trackStore)
    console.log('isOwner', isOwner)
    console.log('currentId', currentUser)
   
const handleNavMixer = () => {
    navigate("/mixer");
}

    return (
        <div className="container-fluid mb-5">

            <AddTrackModal projectId={project.id} onTrackCreated={(newTrack) => trackDispatch({ type: "add_track", payload: newTrack })} />

            <div className="row">
                <p className="uppy text-center">{project.title}</p>
            </div>

            <div className="row all-info text-uppy m-2">

                <div className="col">
                    <div className="text-center">
                        <p className="controls-uppy-text text-white fs-1 desc-header" >Description</p>
                        <p className="description-box text-white p-2 fs-5 d-flex align-items-center justify-content-center">{project.description}</p>
                    </div>
                </div>


                <div className="col">
                    <p className="controls-uppy-text text-white text-center fs-1 details-header">Details</p>

                    <div className="d-flex flex-row justify-content-between p-2 mb-3 deets-proj gap-2">

                        <div className="deets-inside text-center d-flex flex-column justify-content-between p-2">
                            <p className="controls-uppy-text text-white">Key</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-1">{project.key}</p>
                        </div>

                        <div className="deets-inside text-center d-flex flex-column justify-content-between p-2">
                            <p className="controls-uppy-text text-white">Compass</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-1">{project.meter}</p>
                        </div>

                        <div className="deets-inside text-center d-flex flex-column justify-content-between p-2">
                            <p className="controls-uppy-text text-white">BPM</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-1">{project.bpm}</p>
                        </div>

                        <div className="deets-inside text-center d-flex flex-column justify-content-between p-2">
                            <p className="controls-uppy-text text-white" >Instruments</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-1">
                                {project.seeking_instruments.map((inst) => inst.name).join(" ")}
                            </p>
                        </div>

                        <div className="deets-inside text-center d-flex flex-column justify-content-between p-2">
                            <p className="controls-uppy-text text-white" >Roles</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-1">
                                {project.seeking_roles.map((role) => role.name).join(" ")}
                            </p>
                        </div>

                        <div className="deets-inside text-center d-flex flex-column justify-content-between p-2">
                            <p className="controls-uppy-text text-white" >Genre</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-1">
                                {project.genres.map((genre) => genre.name).join(" ")}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="row m-3">

                <div className="col d-flex flex-row justify-content-between">

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 uptrack" data-bs-toggle="modal" data-bs-target="#UploadModal">
                        <p className="m-0 flex-row align-items-center"> 🡹 Upload track</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 downproj" onClick={() => downloadProjectAsZip(trackStore.tracks, project.title)} >
                        <p className="m-0 flex-row align-items-center"> 🡻 Download Project</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 z-2 mixbut" onClick={handleNavMixer} >
                            <p className="m-0 flex-row align-items-center" >⏏ Mixer</p>
                    </button>

                    {isOwner && (
                        <>
                            <button className="btn-uppy d-flex flex-row align-items-center p-2 pubproj z-2" >
                                <p className="m-0 flex-row align-items-center"> 🡽 Publish Project</p>
                            </button>

                            <button className="btn-uppy d-flex flex-row align-items-center p-2 settings-btn z-2 setbut" onClick={() => setShowSettings((prev) => !prev)} >
                                <p className="m-0 flex-row align-items-center"> ⚙ Settings </p>
                            </button>
                        </>
                    )}

                </div>

                <div className="col">
                    <p className="magic-uppy text-center">Here's where the magic happens...</p>
                </div>

                {/* TABS */}
                {isOwner && showSettings && (
                    <>
                        <p className="proj-settings-title text-white mb-4 p-0 m-0">⚙ Project Settings</p>

                        {trackStore.tracks.map((track) => (
                            
                            <div key={track.id} className="track-container text-white gap-3 d-flex align-items-center w-100 my-2">

                                <div className="track_container_info d-flex flex-column justify-content-center align-items-center gap-2 p-2">

                                    <img src={track.uploader?.profile_pic_url} className="collaborator_pic rounded-circle object-fit-cover" />

                                    <div className="text-center d-flex flex-column gap-2 my-3">

                                        <p className="fw-bold p-0 m-0">{track.track_name}</p>

                                        <p className={`p-0 m-0 text-${track.status === 'approved' ? 'success' : track.status === 'pending' ? 'warning' : 'muted'}`}>

                                            {track.status}

                                        </p>

                                    </div>

                                </div>

                                <TrackWaveform track={track} zoomLevel={zoomLevel} onInit={(id, instance) => { wavesurferRefs.current[id] = instance;}} />

                                <div className="d-flex flex-column gap-2">
                                    {track.status !== "approved" && (
                                        <button className="track-approve-btn" onClick={() => handleApprove(track.id)}>Approve</button>
                                    )}
                                    {track.status !== "rejected" && (
                                        <button className="track-discard-btn" onClick={() => handleReject(track.id)}>Discard</button>
                                    )}
                                    {track.file_url !== project.main_track_url && (
                                        <button className="track-maint-btn" onClick={() => handleMainTrackUpload(track.file_url)}>Set as Main Track</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* TRACKS */}

                {project.main_track_url && (
                    <div className="track-container text-white gap-3 d-flex flex-row align-items-center w-100 my-2">
                        <div className="track_container_info d-flex flex-column justify-content-center align-items-center gap-2 p-2">
                            <img className="collaborator_pic rounded-circle object-fit-cover" src={project.owner_pic} />
                            <p className=" mt-2 text-white">Main Track</p>
                        </div>
                        <TrackWaveform key="main" track={{ file_url: project.main_track_url, track_name: "Main Track" }} zoomLevel={zoomLevel} onInit={(id, instance) => { wavesurferRefs.current["main"] = instance;}}/>
                    </div>
                )}
                <div className="text-white mt-4">
                    {(activeTab === 'approved' || !isOwner) && (
                        <details className="dropdown_section">
                            <summary className="fs-4">Individual Tracks</summary>
                            {approvedTracks.length === 0 ? (
                                <p className="text-white">No approved tracks yet.</p>
                            ) : (
                                approvedTracks.map((track) => (
                                    <div className="track-container text-white gap-3 d-flex flex-row align-items-center w-100 my-2 p-2" key={track.id}>
                                        <div className="track_container_info d-flex flex-column justify-content-center align-items-center gap-2 p-2">

                                            <img className="collaborator_pic rounded-circle object-fit-cover" src={track.uploader?.profile_pic_url} />

                                            <p className="text-center">{track.instrument?.name || "No instrument"}</p>
                                            
                                        </div>
                                        <TrackWaveform track={track} zoomLevel={zoomLevel} onInit={(id, instance) => { wavesurferRefs.current[id] = instance;}}/>
                                    </div>
                                ))
                            )}
                        </details>
                    )}

                    {isOwner && activeTab === 'pending' && (
                        <details className="dropdown_section">
                            <summary className="fs-4">Tracks Pending Approval</summary>
                            {pendingTracks.length === 0 ? (
                                <p className="text-muted">No tracks pending approval.</p>
                            ) : (
                                pendingTracks.map((track) => (
                                    <div className="track_container" key={track.id}>
                                        <div className="track_container_info">
                                            <img className="collaborator_pic" src={track.uploader?.profile_pic_url} />
                                            {track.instrument?.name || "No instrument"}
                                        </div>
                                        <TrackWaveform
                                            track={track}
                                            zoomLevel={zoomLevel}
                                            onInit={(id, instance) => {
                                                wavesurferRefs.current[id] = instance;
                                            }}
                                        />
                                        <div className="d-flex gap-2 mt-2">
                                            <button className="btn btn-success" onClick={() => handleApprove(track.id)}>Aprobar</button>
                                            <button className="btn btn-danger" onClick={() => handleReject(track.id)}>Rechazar</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </details>
                    )}
                </div>
            </div>
        </div>
    )
}
export default ProjectDetails;
// src/pages/ProjectDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
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
import { useUserReducer } from "../../reducers/userReducer"
import './ProjectDetails.css'


const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0);
    const [activeTab, setActiveTab] = useState('approved');
    const wavesurferRefs = useRef({});
    const { trackStore, trackDispatch } = useTrackReducer();
    const { userStore } = useUserReducer();
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




    const handleApprove = async (trackId) => {
        try {
            const updated = await approveTrack(trackId);
            trackDispatch({ type: "approve_track", payload: updated });
        } catch (err) {
            console.error("❌ Error al aprobar track", err);
        }
    };

    const handleReject = async (trackId) => {
        try {
            const updated = await rejectTrack(trackId);
            trackDispatch({ type: "reject_track", payload: updated });
        } catch (err) {
            console.error("❌ Error al rechazar track", err);
        }
    };

    if (loading) return <p className="text-white text-center mt-5">Cargando proyecto...</p>;
    if (error) return <p className="text-danger text-center mt-5">{error}</p>;
    if (!project) return null;

    const isOwner = currentUser?.id === project?.owner_id;

    const approvedTracks = trackStore.tracks.filter(t => t.status === 'approved');
    const pendingTracks = trackStore.tracks.filter(t => t.status === 'pending');

    console.log('tracks', trackStore)
    console.log('isOwner', isOwner)
    console.log('currentId', currentUser)
    console.log

    return (
        <div className="container-fluid mb-5">

            <AddTrackModal
                projectId={project.id}
                onTrackCreated={(newTrack) => trackDispatch({ type: "add_track", payload: newTrack })}
            />

            <div className="row">
                <p className="uppy text-center">{project.title}</p>
            </div>

            <div className="row all-info text-uppy m-2">

                <div className="col">
                    <div className="text-center">
                        <p className="controls-uppy-text text-white fs-1 desc-header" >Description</p>
                        <p className="text-white form-info-uppy p-2 fs-5">{project.description}</p>
                    </div>
                </div>


                <div className="col">
                    <p className="controls-uppy-text text-white text-center fs-1 details-header">Details</p>
                    <div className="d-flex flex-row justify-content-between px-4 py-1 deets-proj">

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white">Key</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">{project.key}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white">Compass</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">{project.meter}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white">BPM</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">{project.bpm}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white" >Instruments</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">
                                {project.seeking_instruments.map((inst) => inst.name).join(", ")}
                            </p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white" >Roles</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">
                                {project.seeking_roles.map((role) => role.name).join(", ")}
                            </p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white" >Genre</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">
                                {project.genres.map((genre) => genre.name).join(", ")}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="row m-3">

                <div className="col d-flex flex-row gap-3 ps-5">

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 uptrack" data-bs-toggle="modal" data-bs-target="#UploadModal">
                        <p className="m-0 flex-row align-items-center"><UploadIcon /> Upload track</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 downproj" onClick={() => downloadProjectAsZip(trackStore.tracks, project.title)} >
                        <p className="m-0 flex-row align-items-center"> <DownloadIcon /> Download Project</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 pubproj" >
                        <p className="m-0 flex-row align-items-center"> <SendIcon /> Publish Project</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 mixbut" >
                        <Link to="/mixer" className="text-decoration-none">
                            <p className="m-0 flex-row align-items-center text-light" ><TuneIcon /> Mixer</p>
                        </Link>
                    </button>

                </div>

                <div className="col">
                    <p className="magic-uppy">Here's where the magic happens...</p>
                </div>

                {/* TABS */}
                {isOwner && (
                    <div className="tabs d-flex gap-4 px-5 mt-4">
                        <button className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
                            🎵 Approved Tracks ({approvedTracks.length})
                        </button>
                        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                            ⏳ Pending Tracks ({pendingTracks.length})
                        </button>
                    </div>
                )}

                {/* TRACKS */}
                <div className="text-white mt-4">
                    {(activeTab === 'approved' || !isOwner) && (
                        <details className="dropdown_section">
                            <summary className="fs-4">Approved Tracks</summary>
                            {approvedTracks.length === 0 ? (
                                <p className="text-muted">No approved tracks yet.</p>
                            ) : (
                                approvedTracks.map((track) => (
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
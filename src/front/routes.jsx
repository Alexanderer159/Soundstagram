import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home/Home";
import { EditProfile } from "./pages/EditProfile/EditProfile";
import { AudioUploaderAndPoster } from "./pages/AudioAndUploadPlayback";
import { Profile } from "./pages/Profile/Profile";
import { About } from "./pages/About/About";
import { Register } from "./pages/Register/Register";
import { Easter } from "./pages/Easter/Easter";
import { Mixer } from "./pages/Mixer/Mixer";
import { Feed } from "./pages/Feed/Feed";
import { AddProject } from "./pages/AddProject/AddProject";
import { PruebasWave } from "./pages/Pruebas_Wavesurfer";
import ProjectDetails from "./pages/ProjectDetails/ProjectDetails";
import BeatMaker from "./beatmkaer/BeatMaker";
import UploadTrackForm from "./components/UploadTrackForm";

export const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/hans" element={<Easter />} />
      <Route path="/about" element={< About />} />
      <Route path="/feed" element={< Feed />} />
      <Route path="/mixer" element={< Mixer />} />
      <Route path="/profile" element={< Profile />} />
      <Route path="/editprofile" element={< EditProfile />} />
      <Route path="/uploader-poster" element={<AudioUploaderAndPoster />} />
      <Route path="/pruebas" element={<PruebasWave />} />
      <Route path="/add_project" element={<AddProject />} />
      <Route path="/beatmaker" element={<BeatMaker />} />
      <Route path="cloudinarytest" element={<UploadTrackForm projectId={5} />} />
      <Route path="/project/:id" element={<ProjectDetails />} />
      {/* Add more routes as needed */}
    </Route>
  )
);
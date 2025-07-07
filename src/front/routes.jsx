import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { MultitrackEditor } from "./pages/Demo";
import { ProjectDetailPage } from "./pages/Desktop_Project_Details_Page";
import { NotificationsPage } from "./pages/Desktop_Notifications_Page";
import { EditProfilePage } from "./pages/Desktop_Edit_Profile_Page";
import { NewContributionPage } from "./pages/Desktop_New_Contribution_Page";
import { ExploreProjectsPage } from "./pages/Desktop_Explore_Projects_Page";
import { CommentsPage } from "./pages/Desktop_Comments_Page";
import { AudioUploaderAndPoster } from "./pages/AudioAndUploadPlayback";
import { DemoProfile } from "./pages/DemoProfile";
import { DesktopProfilePage } from "./pages/Desktop_Profile_page";
import { AboutUs } from "./pages/About_Us";
import { RegisterDemo } from "./pages/RegisterDemo";
import { EasterPage } from "./pages/Easter";
import { Mixer } from "./pages/Mixer";
import Feed from "./pages/Feed/Feed";
import { AddProject } from "./pages/AddProject";
import { PruebasWave } from "./pages/Pruebas_Wavesurfer";

export const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<MultitrackEditor />} />
      <Route path="/register" element={<RegisterDemo />} />
      <Route path="/hans" element={<EasterPage />} />
      <Route path="/about_us" element={< AboutUs />} />
      <Route path="/feed" element={< Feed />} />
      <Route path="/mixer" element={< Mixer />} />
      <Route path="/demoProfile" element={< DemoProfile />} />
      <Route path="/projectdetails" element={< ProjectDetailPage />} />
      <Route path="/notifications" element={< NotificationsPage />} />
      <Route path="/profile" element={< DesktopProfilePage />} />
      <Route path="/editprofile" element={< EditProfilePage />} />
      <Route path="/newcontribution" element={< NewContributionPage />} />
      <Route path="/explore" element={< ExploreProjectsPage />} />
      <Route path="/comments" element={< CommentsPage />} />
      <Route path="/uploader-poster" element={<AudioUploaderAndPoster />} />
      <Route path="/pruebas" element={<PruebasWave />} />
      <Route path="/add_project" element={<AddProject />} />
    </Route>
  )
);
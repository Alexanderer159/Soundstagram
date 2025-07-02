import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { FeedPage } from "./pages/Desktop_Feed_Page";
import { ProjectDetailPage } from "./pages/Desktop_Project_Details_Page";
import { NotificationsPage } from "./pages/Desktop_Notifications_Page";
import { EditProfilePage } from "./pages/Desktop_Edit_Profile_Page";
import { NewContributionPage } from "./pages/Desktop_New_Contribution_Page";
import { AddExistingTrackPage } from "./pages/Desktop_Add_existing_track_page";
import { ExploreProjectsPage } from "./pages/Desktop_Explore_Projects_Page";
import { CommentsPage } from "./pages/Desktop_Comments_Page";
import { AudioUploaderAndPoster } from "./pages/AudioAndUploadPlayback";
import { DemoProfile } from "./pages/DemoProfile";
import { DesktopProfilePage } from "./pages/Desktop_Profile_page";
import { AboutUs } from "./pages/About_Us";
import { RegisterDemo } from "./pages/RegisterDemo";

export const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/register" element={<RegisterDemo />} />
      <Route path="/about_us" element={< AboutUs />} />
      <Route path="/feed" element={< FeedPage />} />
      <Route path="/demoProfile" element={< DemoProfile />} />
      <Route path="/projectdetails" element={< ProjectDetailPage />} />
      <Route path="/notifications" element={< NotificationsPage />} />
      <Route path="/profile" element={< DesktopProfilePage />} />
      <Route path="/editprofile" element={< EditProfilePage />} />
      <Route path="/newcontribution" element={< NewContributionPage />} />
      <Route path="/addtrack" element={< AddExistingTrackPage />} />
      <Route path="/explore" element={< ExploreProjectsPage />} />
      <Route path="/comments" element={< CommentsPage />} />
   
      <Route path="/uploader-poster" element={<AudioUploaderAndPoster />} />
    </Route>
  )
);
// Import necessary components and functions from react-router-dom.

import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { RegisterPage } from "./pages/Desktop_Register_Page";
import { FeedPage } from "./pages/Desktop_Feed_Page";
import { ProjectDetailPage } from "./pages/Desktop_Project_Details_Page";
import { NotificationsPage } from "./pages/Desktop_Notifications_Page";
import { EditProfilePage } from "./pages/Desktop_Edit_Profile_Page";
import { NewContributionPage } from "./pages/Desktop_New_Contribution_Page";
import { AddExistingTrackPage } from "./pages/Desktop_Add_existing_track_page";
import { ExploreProjectsPage } from "./pages/Desktop_Explore_Projects_Page";
import { CommentsPage } from "./pages/Desktop_Comments_Page";
// import { AudioUploadAndPlayback } from "./pages/AudioAndUploadPlayback";
import { AudioUploaderAndPoster } from "./pages/AudioAndUploadPlayback";
import { DemoProfile } from "./pages/DemoProfile";
import { DesktopProfilePage } from "./pages/Desktop_Profile_page";
import { AboutUs } from "./pages/About_Us";
import { RegisterDemo } from "./pages/RegisterDemo";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/registerdemo" element={<RegisterDemo />} />
      <Route path="/register" element={< RegisterPage />} />
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
      {/* <Route path="/upload-audio" element={<AudioUploadAndPlayback />} /> */}
      <Route path="/uploader-poster" element={<AudioUploaderAndPoster />} />
    </Route>
  )
);
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'  // Global styles for your application
import { RouterProvider } from "react-router-dom";  // Import RouterProvider to use the router
import { router } from "./routes";  // Import the router configuration
import { UserProvider } from './reducers/userReducer';
import { ProjectProvider } from './reducers/projectReducer';
import { TrackProvider } from './reducers/trackReducer';
import { NotificationProvider } from './reducers/notificationReducer';  // Import NotificationProvider to manage notifications
import { BackendURL } from './components/BackendURL';
import { LikeProvider } from './reducers/likeReducer';
import { FollowProvider } from './reducers/followReducer';
import { ChatProvider } from './reducers/chatReducer';  // Import ChatProvider to manage chat state

const Main = () => {

    if (! import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL == "") return (
        <React.StrictMode>
            <BackendURL />
        </React.StrictMode>
    );
    return (
        <React.StrictMode>
            {/* Provide global state to all components */}
            <UserProvider>
                <ProjectProvider>
                    <TrackProvider>
                        <NotificationProvider>
                            <LikeProvider>
                                <FollowProvider>
                                    <ChatProvider>
                                        {/* Set up routing for the application */}
                                        <RouterProvider router={router}>
                                        </RouterProvider>
                                    </ChatProvider>
                                </FollowProvider>
                            </LikeProvider>
                        </NotificationProvider>
                    </TrackProvider>
                </ProjectProvider>
            </UserProvider>
        </React.StrictMode >
    );
}

// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById('root')).render(<Main />)

import { Outlet } from "react-router-dom/dist"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import "../styles/index.css"

export const Layout = () => {
    return (
        <>
            <Navbar />
                <div className="py-5">
                    <Outlet />
                </div>
            <Footer />
            <ToastContainer />
        </>
    )
}
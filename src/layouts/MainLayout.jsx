import { useState } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all `}>
                <Navbar />
                <div className="p-6 mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;

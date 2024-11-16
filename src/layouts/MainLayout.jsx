import { Outlet } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoCreate } from "react-icons/io5";
import { GoHistory } from "react-icons/go";
import { useState } from "react";

const MainLayout = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Container สำหรับ Sidebar และเนื้อหาหลัก */}
            <div className="flex">
                {/* Sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                        } transition-transform duration-300 ease-in-out bg-gray-800 text-white w-64`}
                >
                    {/* Header ของ Sidebar */}
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-xl font-bold">Menu</h1>
                        <button onClick={toggleSidebar}>
                            <FaTimes className="fill-slate-50" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="mt-4">
                        <ul className="p-3">
                            <li className="p-4 hover:bg-gray-700 cursor-pointer rounded-md mb-4 flex items-center">
                                <IoCreate className="text-2xl mr-3" />
                                <Link to="/" className="text-gray-50">
                                    สร้างรายการ
                                </Link>
                            </li>
                            <li className="p-4 hover:bg-gray-700 cursor-pointer rounded-md mb-4 flex items-center">
                                <GoHistory className="text-2xl mr-3" />
                                <Link to="/history" className="text-gray-50">
                                    ประวัติการซื้อ-ขาย
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4">
                    {/* ปุ่มสำหรับเปิด Sidebar */}
                    <button onClick={toggleSidebar} className="text-2xl">
                        <FaBars />
                    </button>

                    {/* Content ที่จะเปลี่ยนไปตาม Route */}
                    <div className="mt-4 container mx-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainLayout;

import { useState } from 'react';
import { LuTruck } from "react-icons/lu";
import { GiHandTruck } from "react-icons/gi";
import { LuHistory } from "react-icons/lu";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { FaSquarePollVertical } from "react-icons/fa6";
import { RxDashboard } from "react-icons/rx";
import { Link } from 'react-router-dom';
import { PiNotePencil } from "react-icons/pi";
import { HiOutlineDocumentReport } from "react-icons/hi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div
            className={`bg-slate-50 h-screen border-r p-5 pt-8 ${isOpen ? 'w-64' : 'w-20'} duration-300  fixed left-0 top-0`}
        >
            <div className="flex items-center justify-between mb-6">
                {/* Logo Section */}
                <div className="flex items-center gap-x-4">
                    <div className={`text-indigo-50 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-700 p-2 text-2xl duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
                        <FaSquarePollVertical className='fill-indigo-50 ' />
                    </div>
                    <h1 className={`text-xl font-bold duration-300 ${!isOpen && 'hidden'}`}>
                        TEXCALC
                    </h1>
                </div>

                {/* Toggle */}
                <div
                    className="bg-white p-1 border rounded-lg text-center absolute top-30 right-[-18px] cursor-pointer"
                    onClick={toggleSidebar}
                >
                    <TbLayoutSidebarLeftCollapse className={`${!isOpen ? 'rotate-180' : 'rotate-0'} duration-150 stroke-gray-500`} size={24} />
                </div>
            </div>

            <div className={`${!isOpen ? 'hidden' : ''} text-gray-500 mt-12 mb-6`}>เมนูหลัก</div>

            {/* Menu Items */}
            <ul className='text-gray-600'>
                <li className="mb-4">
                    <Link
                        to="/"
                        className="flex border-w items-center gap-x-4 p-2 hover:bg-white hover:shadow-md hover:text-gray-900 hover:font-semibold rounded-md"
                    >
                        <RxDashboard size={20} />
                        <span className={`${!isOpen && 'hidden'} duration-100`}>หน้าแรก</span>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link
                        to="/create-purchase-bill"
                        className="flex border-w items-center gap-x-4 p-2 hover:bg-white hover:shadow-md hover:text-gray-900 hover:font-semibold rounded-md"
                    >
                        <GiHandTruck size={24} />
                        <span className={`${!isOpen && 'hidden'} duration-100`}>สร้างบิลรับซื้อ</span>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link
                        to="/create-sales-bill"
                        className="flex border-w items-center gap-x-4 p-2 hover:bg-white hover:shadow-md hover:text-gray-900 hover:font-semibold rounded-md"
                    >
                        <LuTruck size={24} />
                        <span className={`${!isOpen && 'hidden'} duration-100`}>สร้างบิลขายออก</span>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link
                        to="/create-expense"
                        className="flex border-w items-center gap-x-4 p-2 hover:bg-white hover:shadow-md hover:text-gray-900 hover:font-semibold rounded-md"
                    >
                        <PiNotePencil size={24} />
                        <span className={`${!isOpen && 'hidden'} duration-100`}>บันทึกค่าใช้จ่าย</span>
                    </Link>
                </li>
            </ul>

            <div className={`${!isOpen ? 'hidden' : ''} text-gray-500 mt-12 mb-6`}>รายงาน</div>
            <ul>
                <li className="mb-4">
                    <Link
                        to="/history"
                        className="flex border-w items-center gap-x-4 p-2 hover:bg-white hover:shadow-md hover:text-gray-900 hover:font-semibold rounded-md"
                    >
                        <LuHistory size={24} />
                        <span className={`${!isOpen && 'hidden'} duration-100`}>ประวัติ</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;

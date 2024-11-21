import { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaFastBackward, FaFastForward } from 'react-icons/fa';
import { AiOutlineDelete } from "react-icons/ai";
import Modal from './Modal';

function DynamicTable({ cols, rows, loading, type }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortedData, setSortedData] = useState(rows);
    const [sortOrder, setSortOrder] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);

    useEffect(() => {
        setSortedData(rows);
    }, [rows]);

    const formatNumber = (number) => {
        return number.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getEndpoint = (action) => {
        const baseUrl = 'http://127.0.0.1:8000';
        const endpoints = {
            purchase: `${baseUrl}/purchase`,
            sales: `${baseUrl}/sales`,
            expense: `${baseUrl}/expense`
        };
        return `${endpoints[type]}/${selectedRow.ID}`;
    };


    const handleDelete = async () => {
        try {
            const response = await fetch(getEndpoint('delete'), {
                method: 'DELETE',
            });

            if (response.ok) {
                setIsDeleteModalOpen(false);
                // Trigger data refresh here
                window.location.reload();
            } else {
                alert('การลบข้อมูลไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };


    const openDeleteModal = (row) => {
        console.log("Selected Row for Deletion:", row);
        setSelectedRow(row);
        setIsDeleteModalOpen(true);
    };

    const handlePageChange = (page) => setCurrentPage(page);
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    };

    const handleSort = (col) => {
        const sorted = [...sortedData];
        sorted.sort((a, b) => {
            if (a[col] < b[col]) return sortOrder ? -1 : 1;
            if (a[col] > b[col]) return sortOrder ? 1 : -1;
            return 0;
        });
        setSortedData(sorted);
        setSortOrder(!sortOrder);
    };

    return (
        <div className="bg-white rounded-xl shadow-md">

            <h2 className="text-xl font-semibold p-6 pb-0">ข้อมูล</h2>

            <div className="p-6 pb-0 flex gap-4 items-center mb-4">
                จำนวนข้อมูล
                <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="border border-gray-300 p-2 rounded-md"
                >
                    <option value={5}>5 ข้อมูล</option>
                    <option value={10}>10 ข้อมูล</option>
                    <option value={20}>20 ข้อมูล</option>
                </select>
                ต่อหน้า
            </div>

            <div className="relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                        <div className="loader"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">ไม่พบข้อมูล</div>
                ) : (
                    <table className="min-w-full bg-white border border-gray-50">
                        <thead>
                            <tr className="text-left border-b-2 border-t-2 bg-slate-100">

                                {cols.map((col, index) => (

                                    col !== 'ID' &&
                                    <th
                                        key={index}
                                        className={`${col === 'วันที่' ? 'w-40' : ''} px-4 py-2 cursor-pointer`}
                                        onClick={() => handleSort(col)}
                                    >
                                        {col}
                                        <span className="ml-2">
                                            {sortOrder ? '↑' : '↓'}
                                        </span>
                                    </th>
                                ))}
                                <th className="px-4 py-2 w-24"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-200">
                                    {cols.map((col, index) => (
                                        col !== 'ID' && (
                                            <td key={index} className="px-4 py-4">
                                                {typeof row[col] === 'number' ? formatNumber(row[col]) : row[col]}
                                            </td>
                                        )
                                    ))}
                                    <td className="py-4 px-6 flex items-end">
                                        <div className=" bg-slate-100 border rounded-full p-1 cursor-pointer hover:shadow-inner duration-150" onClick={() => openDeleteModal(row)}>
                                            <AiOutlineDelete
                                                size={24}
                                                className='duration-150 fill-red-600 hover:fill-red-700 '

                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </div>



            {/* Pagination Section */}
            <div className="flex justify-center items-center gap-4 py-6">
                <button
                    className="bg-indigo-500 text-white py-2 px-4 rounded-full"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                >
                    <FaFastBackward />
                </button>
                <button
                    className="bg-indigo-500 text-white py-2 px-4 rounded-full"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <FaArrowLeft />
                </button>

                <span className="text-lg">
                    หน้า {currentPage} ของ {Math.ceil(sortedData.length / rowsPerPage)}
                </span>

                <button
                    className="bg-indigo-500 text-white py-2 px-4 rounded-full"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage * rowsPerPage >= sortedData.length}
                >
                    <FaArrowRight />
                </button>
                <button
                    className="bg-indigo-500 text-white py-2 px-4 rounded-full"
                    onClick={() => handlePageChange(Math.ceil(sortedData.length / rowsPerPage))}
                    disabled={currentPage * rowsPerPage >= sortedData.length}
                >
                    <FaFastForward />
                </button>
            </div>



            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="ยืนยันการลบข้อมูล"
            >
                <div className="space-y-4">
                    <p>คุณต้องการลบข้อมูลนี้ใช่หรือไม่?</p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            ลบข้อมูล
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}

export default DynamicTable;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale';
import { FaEdit, FaTrash } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';

// Register Thai Locale
registerLocale('th', th);

const History = () => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    // Fetch Data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/history/', {
                    params: {
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        searchTerm: searchTerm.trim(),
                    },
                });
                setRecords(response.data);
                setFilteredRecords(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [startDate, endDate, searchTerm]);

    // Filter and Sort Data
    const handleSearch = (e) => setSearchTerm(e.target.value);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/history/${id}`);
            const newRecords = records.filter((record) => record.id !== id);
            setRecords(newRecords);
            setFilteredRecords(newRecords);
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const handleModalOpen = (id) => {
        setModalOpen(true);
        setRecordToDelete(id);
    };

    const handleConfirmDelete = () => {
        handleDelete(recordToDelete);
        setModalOpen(false);
    };

    return (
        <div className="container mx-auto p-6">
            <h4 className="text-2xl font-bold mb-6">ประวัติการซื้อ-ขาย</h4>

            {/* Search Input */}
            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="ค้นหาชื่อผู้ขาย"
                    className="p-2 border rounded w-full"
                />
            </div>

            {/* Date Pickers */}
            <div className="mb-6 flex gap-4">
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    locale="th"
                    className="border p-2 rounded"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    locale="th"
                    className="border p-2 rounded"
                />
            </div>

            {/* Data Table */}
            <table className="min-w-full border-collapse block md:table">
                <thead>
                    <tr>
                        <th className="p-2 border">วันที่</th>
                        <th className="p-2 border">ชื่อผู้ขาย</th>
                        <th className="p-2 border">น้ำหนักสุทธิ</th>
                        <th className="p-2 border">ยอดเงิน</th>
                        <th className="p-2 border">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRecords.map((record) => (
                        <tr key={record.id}>
                            <td className="p-2 border">{record.date}</td>
                            <td className="p-2 border">{record.name}</td>
                            <td className="p-2 border">{record.netWeight}</td>
                            <td className="p-2 border">{record.totalAmount}</td>
                            <td className="p-2 border text-center">
                                <button onClick={() => handleModalOpen(record.id)}>
                                    <FaTrash className="text-red-500" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal for Delete Confirmation */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h4>คุณต้องการลบข้อมูลนี้ใช่หรือไม่?</h4>
                        <div className="mt-4">
                            <button
                                onClick={handleConfirmDelete}
                                className="bg-red-500 text-white py-2 px-4 rounded mr-2"
                            >
                                ยืนยัน
                            </button>
                            <button onClick={() => setModalOpen(false)} className="bg-gray-300 py-2 px-4 rounded">
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;

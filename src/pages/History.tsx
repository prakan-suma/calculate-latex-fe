import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id, th } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, subMonths } from 'date-fns';
import { FaEdit, FaTrash } from 'react-icons/fa';

// Register Thai Locale
registerLocale('th', th);

interface PurchaseRecord {
    id: string;
    date: string;
    name: string;
    rubberWeight: number;
    tankWeight: number;
    netWeight: number;
    percentage: number;
    dryRubber: number;
    pricePerKg: number;
    totalAmount: number;
}

const History: React.FC = () => {
    const [sortColumn, setSortColumn] = useState<string>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [records, setRecords] = useState<PurchaseRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PurchaseRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [quickFilter, setQuickFilter] = useState<string>('');
    const [minContent, setMinContent] = useState<boolean>(true);
    const [recordToDelete, setRecordToDelete] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/history/', {
                    params: {
                        startDate: startDate ? startDate.toISOString().split('T')[0] : '',
                        endDate: endDate ? endDate.toISOString().split('T')[0] : '',
                        searchTerm: searchTerm.trim()
                    }
                });

                const data = response.data.map((record: any) => ({
                    id: record.id,
                    date: record.date,
                    name: record.name || '',
                    rubberWeight: record.rubberWeight || 0,
                    tankWeight: record.tankWeight || 0,
                    netWeight: record.netWeight || 0,
                    percentage: record.percentage || 0,
                    dryRubber: record.dryRubber || 0,
                    pricePerKg: record.pricePerKg || 0,
                    totalAmount: record.totalAmount || 0
                }));

                // เรียงข้อมูลตามวันที่ใหม่ที่สุดไปยังเก่าสุด
                const sortedData = data.sort((a, b) => (a.date > b.date ? -1 : 1));

                setRecords(sortedData);
                setFilteredRecords(sortedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [startDate, endDate, searchTerm]);


    // Sorting Function
    const handleSort = (column: string) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);

        const sortedData = [...filteredRecords].sort((a, b) => {
            if (a[column] < b[column]) return newDirection === 'asc' ? -1 : 1;
            if (a[column] > b[column]) return newDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredRecords(sortedData);
    };


    useEffect(() => {
        const sortedData = [...records].sort((a, b) => (a.date > b.date ? -1 : 1));
        setFilteredRecords(sortedData);
    }, [records]);


    useEffect(() => {
        let filtered = records;
        if (searchTerm) {
            filtered = filtered.filter((record) =>
                record.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (startDate && endDate) {
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];
            filtered = filtered.filter((record) => record.date >= start && record.date <= end);
        }
        setFilteredRecords(filtered);
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate, records]);


    const totalWeight = filteredRecords.reduce((acc, record) => acc + record.netWeight, 0);
    const totalAmount = filteredRecords.reduce((acc, record) => acc + record.totalAmount, 0);

    const indexOfLastRecord = currentPage * rowsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

    const formatNumber = (num: number) => {
        return num.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    const handleQuickFilter = (filter: string) => {
        const today = new Date();
        let start: Date;
        const end = new Date(today);  // วันสิ้นสุดเป็นวันนี้

        switch (filter) {
            case 'today': // เพิ่มตัวเลือกวันนี้
                start = today;
                break;
            case '1_day':
                start = subDays(today, 1);  // ย้อนกลับไป 1 วัน
                break;
            case '15_days':
                start = subDays(today, 15);
                break;
            case '30_days':
                start = subDays(today, 30);
                break;
            case '3_months':
                start = subMonths(today, 3);
                break;
            case '1_year':
                start = subMonths(today, 12);
                break;
            default:
                return; // หากไม่มีการเลือกให้ไม่ทำอะไร
        }


        setStartDate(start);
        setEndDate(end);

        // ส่ง startDate และ endDate ไปยัง API
        setSearchTerm(""); // เคลียร์ searchTerm ในกรณีที่ต้องการค้นหาตามวันที่
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/history/${id}`);
            // Remove from both records and filteredRecords
            setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
            setFilteredRecords(prevFilteredRecords => prevFilteredRecords.filter(record => record.id !== id));
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const handleModalOpen = (id: string) => {
        setModalOpen(true);
        setRecordToDelete(id); // Store the record ID to delete when user confirms
    };

    // Assuming there's a modal that will call this function when the user confirms deletion
    const handleConfirmDelete = () => {
        if (recordToDelete) {
            handleDelete(recordToDelete);
            setRecordToDelete(null); // Reset after deletion
            setModalOpen(false); // Close modal
        }
    };





    return (
        <main className="mx-auto p-6">
            <h4 className="text-2xl font-semibold text-center mb-6">ประวัติการซื้อ-ขาย</h4>

            <div className="flex flex-col justify-between md:flex-row items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <p>ค้นหาชื่อผู้ขาย</p>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อผู้ขาย"
                        className="border border-gray-300 rounded p-2 "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <p>เลือกวันที่</p>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="วันที่เริ่มต้น"
                        locale="th"
                        className="border border-gray-300 rounded p-2"
                    />
                    -
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="วันที่สิ้นสุด"
                        locale="th"
                        className="border border-gray-300 rounded p-2"
                    />
                </div>

            </div>


            <div className="flex items-center mb-6 gap-6">

                <label className=" flex items-center cursor-pointer">
                    {/* แสดงผลตามค่า minContent */}
                    <p className='mr-6'>รูปแบบย่อ</p>
                    <input
                        type="checkbox"
                        checked={minContent}
                        onChange={() => setMinContent(!minContent)}
                        className="sr-only peer"
                    />

                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer dark:bg-gray-200 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-400 peer-checked:bg-blue-400"></div>

                </label>


                <select
                    className="border border-gray-300 rounded p-2"
                    value={quickFilter}
                    onChange={(e) => {
                        setQuickFilter(e.target.value);
                        handleQuickFilter(e.target.value);
                    }}
                >
                    <option value="">--เลือกช่วงเวลา--</option>
                    <option value="today">วันนี้</option>
                    <option value="1_day">ย้อนหลัง 1 วัน</option>
                    <option value="15_days">ย้อนหลัง 15 วัน</option>
                    <option value="30_days">ย้อนหลัง 30 วัน</option>
                    <option value="3_months">ย้อนหลัง 3 เดือน</option>
                    <option value="1_year">ย้อนหลัง 1 ปี</option>
                </select>

            </div>

            <div className="rounded-md overflow-x-auto">
                <table className="rounded-md min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-slate-200 text-gray-600 uppercase text-sm leading-normal">
                            <th onClick={() => handleSort('date')} className="py-3 px-6 text-left cursor-pointer">
                                วันที่ {sortColumn === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSort('name')} className="py-3 px-6 text-left cursor-pointer">
                                ชื่อผู้ขาย {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>

                            {/* hidden */}
                            {!minContent && <> <th onClick={() => handleSort('rubberWeight')} className="py-3 px-6 text-right cursor-pointer">
                                น้ำหนักยาง {sortColumn === 'rubberWeight' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            </>}

                            {!minContent && <>
                                <th onClick={() => handleSort('tankWeight')} className="py-3 px-6 text-right cursor-pointer">
                                    น้ำหนักถัง {sortColumn === 'tankWeight' && (sortDirection === 'asc' ? '▲' : '▼')}
                                </th>
                            </>}


                            <th onClick={() => handleSort('netWeight')} className="py-3 px-6 text-right cursor-pointer">
                                น้ำหนักสุทธิ {sortColumn === 'netWeight' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>

                            {!minContent && <>
                                <th onClick={() => handleSort('percentage')} className="py-3 px-6 text-right cursor-pointer">
                                    % {sortColumn === 'percentage' && (sortDirection === 'asc' ? '▲' : '▼')}
                                </th>
                            </>}


                            <th onClick={() => handleSort('dryRubber')} className="py-3 px-6 text-right cursor-pointer">
                                ยางแห้ง {sortColumn === 'dryRubber' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>


                            <th onClick={() => handleSort('pricePerKg')} className="py-3 px-6 text-right cursor-pointer">
                                ราคารับซื้อ {sortColumn === 'pricePerKg' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>


                            <th onClick={() => handleSort('totalAmount')} className="py-3 px-6 text-right cursor-pointer">
                                ยอดเงิน {sortColumn === 'totalAmount' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>

                            <th></th>

                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.map((record) => (
                            <tr key={record.id} className="border-b border-gray-300 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">{record.date}</td>
                                <td className="py-3 px-6 text-left">{record.name}</td>

                                {!minContent && <>
                                    <td className="py-3 px-6 text-right">{formatNumber(record.rubberWeight)}</td>
                                </>}

                                {!minContent && <> <td className="py-3 px-6 text-right">{formatNumber(record.tankWeight)}</td></>}

                                <td className="py-3 px-6 text-right bg-slate-200">{formatNumber(record.netWeight)}</td>

                                {!minContent && <><td className="py-3 px-6 text-right">{formatNumber(record.percentage)}%</td></>}

                                <td className="py-3 px-6 text-right">{formatNumber(record.dryRubber)}</td>

                                <td className="py-3 px-6 text-right">{formatNumber(record.pricePerKg)} บาท</td>

                                <td className="py-3 px-6 text-right bg-slate-200">{formatNumber(record.totalAmount)} บาท</td>

                                <td className="py-3 px-6 text-center">
                                    {/* <button
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                        onClick={() => handleEdit(record)}
                                    >
                                        <FaEdit />
                                    </button> */}

                                    <button
                                        onClick={() => handleModalOpen(record.id)}
                                    >
                                        <FaTrash className="fill-red-500 hover:fill-red-700" />
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-semibold text-gray-900 ">
                            {!minContent && <>
                                <td className="py-3 px-6 text-left"></td>
                                <td className="py-3 px-6 text-right"></td>
                            </>}

                            <td className="py-3 px-6 text-right"></td>
                            <td className="py-3 px-6 text-right">รวม</td>
                            <td className="py-3 px-6 text-right bg-slate-300 ">{formatNumber(totalWeight)} กก.</td>

                            {!minContent && <>
                                <td className="py-3 px-6 text-right"></td>
                            </>}
                            <td className="py-3 px-6 text-right"></td>

                            <td className="py-3 px-6 text-right">รวม</td>
                            <td className="py-3 px-6 text-right bg-slate-300">{formatNumber(totalAmount)} บาท</td>

                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-4">
                <button
                    className="rounded-md bg-slate-400 text-white py-2 px-4"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                >
                    หน้าแรก
                </button>
                <button
                    className="rounded-md bg-slate-400 text-white py-2 px-4"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ย้อนกลับ
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="rounded-md bg-slate-400 text-white py-2 px-4"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    ต่อไป
                </button>
                <button
                    className="rounded-md bg-slate-400 text-white py-2 px-4"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    สุดท้าย
                </button>
            </div>

            <div
                className={`${!modalOpen ? 'hidden' : ''} fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]`}>
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 relative">
                    <svg onClick={() => setModalOpen(false)} xmlns="http://www.w3.org/2000/svg"
                        className="w-3 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right" viewBox="0 0 320.591 320.591">
                        <path
                            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                            data-original="#000000"></path>
                        <path
                            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                            data-original="#000000"></path>
                    </svg>

                    <div className="my-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 fill-red-500 inline" viewBox="0 0 24 24">
                            <path
                                d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z"
                                data-original="#000000" />
                            <path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z"
                                data-original="#000000" />
                        </svg>
                        <h4 className="text-gray-800 text-lg font-semibold mt-4">แน่ใจว่าคุณต้องการลบรายการนี้ ?</h4>
                        <p className="text-sm text-gray-600 mt-4">เมื่อคุณกด "ลบรายการนี้" จะไม่สามารถกู้คืนข้อมูลนี้ได้อีก, โปรดตรวจสอบข้อมูลก่อนกดยืนยัน</p>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg text-white text-sm tracking-wide bg-red-500 hover:bg-red-600 active:bg-red-500"
                            onClick={handleConfirmDelete}
                        >ลบรายการนี้</button>
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200"
                            onClick={() => setModalOpen(false)}
                        >ยกเลิก</button>
                    </div>
                </div>
            </div>
        </main >

    );
};

export default History;

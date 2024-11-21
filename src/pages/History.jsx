import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DynamicTable from '../components/DynamicTable';
import { FaSearch } from 'react-icons/fa';
import CardSumData from '../components/CardSumData';

const columnMappings = {
    purchase: {
        id: 'ID',
        date: 'วันที่',
        name: 'ชื่อผู้ขาย',
        rubberWeight: 'น้ำหนักน้ำยาง',
        tankWeight: 'น้ำหนักถัง',
        netWeight: 'น้ำหนักสุทธิ',
        percentage: '%',
        dryRubberWeight: 'น้ำหนักยางแห้ง',
        buyingPrice: 'ราคารับซื้อ',
        note: "เพิ่มเติม",
        noteAmount: "จำนวน",
        totalAmount: 'ยอดเงิน',
    },
    sales: {
        id: 'ID',
        date: 'วันที่',
        totalDryRubberWeight: 'น้ำหนักยางแห้ง',
        pricePurchase: 'ราคารับซื้อ',
        serviceCharge: 'ค่าบริการ',
        totalAmount: 'ยอดเงิน',
    },
    expense: {
        id: 'ID',
        date: 'วันที่',
        note: 'รายละเอียด',
        amount: 'จำนวนเงิน',
    },
};

const transformColumns = (data, mapping) => {
    const cols = Object.values(mapping);
    const rows = data.map((item) => {
        const newRow = {};
        Object.keys(mapping).forEach((key) => {

            if (key === 'note' && item[key] === "") {
                newRow[mapping[key]] = null;
            } else if (key === 'noteAmount' && item['note'] === "") {
                newRow[mapping[key]] = null;
            } else {
                newRow[mapping[key]] = item[key];
            }
        });
        return newRow;
    });
    return { cols, rows };
};



function History() {
    // State initialization with fallback to localStorage values
    const [startDate, setStartDate] = useState(() => {
        const savedStartDate = localStorage.getItem('startDate');
        return savedStartDate ? new Date(savedStartDate) : new Date();
    });
    const [endDate, setEndDate] = useState(() => {
        const savedEndDate = localStorage.getItem('endDate');
        return savedEndDate ? new Date(savedEndDate) : new Date();
    });
    const [selectedOption, setSelectedOption] = useState(() => {
        return localStorage.getItem('selectedOption') || 'purchase';
    });
    const [nameFilter, setNameFilter] = useState(() => {
        return localStorage.getItem('nameFilter') || '';
    });
    const [loading, setLoading] = useState(false);
    const [cols, setCols] = useState([]);
    const [rows, setRows] = useState([]);
    const [summaryData, setSummaryData] = useState(null);

    const quickSearchOptions = [
        { label: 'ปัจจุบัน', value: 'today' },
        { label: 'ย้อนหลัง 15 วัน', value: 'last_15_days' },
        { label: '1 เดือน', value: '1_month' },
        { label: '3 เดือน', value: '3_months' },
        { label: '6 เดือน', value: '6_months' },
        { label: '1 ปี', value: '1_year' },
    ];


    const calculateSummary = (data) => {
        let summary = {};
        if (selectedOption === 'purchase') {
            summary = {
                'น้ำหนักสุทธิรวม': data.reduce((sum, item) => sum + (item.netWeight || 0), 0),
                'น้ำหนักยางแห้งรวม': data.reduce((sum, item) => sum + (item.dryRubberWeight || 0), 0),
                'ยอดเงินรวม': data.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
            };
        } else if (selectedOption === 'sales') {
            summary = {
                'น้ำหนักยางแห้งรวม': data.reduce((sum, item) => sum + (item.totalDryRubberWeight || 0), 0),
                'ยอดเงินรวม': data.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
            };
        } else if (selectedOption === 'expense') {
            summary = {
                'จำนวนเงินรวม': data.reduce((sum, item) => sum + (item.amount || 0), 0),
            };
        }
        setSummaryData(summary);
    };

    const getReadOnlyFields = (selectedOption, isEditMode) => {
        const readOnlyFields = [];
        if (selectedOption === 'purchase') {
            readOnlyFields.push('note', 'noteAmount'); // ห้ามแก้ไข note และ noteAmount
        }
        if (isEditMode) {
            readOnlyFields.push('totalAmount'); // ห้ามแก้ไข totalAmount ในทุกประเภท
        }
        return readOnlyFields;
    };


    const fetchData = async () => {
        setLoading(true);
        let url = '';
        switch (selectedOption) {
            case 'purchase':
                url = `https://suma-latex-be.onrender.com/purchases?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`;
                break;
            case 'sales':
                url = `https://suma-latex-be.onrender.com/sales?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`;
                break;
            case 'expense':
                url = `https://suma-latex-be.onrender.com/expense?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`;
                break;
            default:
                return;
        }

        try {
            const response = await fetch(url);
            if (response.ok) {
                const rawData = await response.json();
                const filteredData = nameFilter
                    ? rawData.filter((item) => item.name && item.name.includes(nameFilter))
                    : rawData;

                const { cols, rows } = transformColumns(filteredData, columnMappings[selectedOption]);
                setCols(cols);
                setRows(rows);

                calculateSummary(filteredData);
            } else if (response.status === 500) {
                setCols(Object.values(columnMappings[selectedOption]));
                setRows([]);
                setSummaryData(null);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption, startDate, endDate, nameFilter]);

    const handleQuickSearch = (option) => {
        const now = new Date();
        let start, end;

        switch (option) {
            case 'today':
                start = end = now;
                break;
            case 'last_15_days':
                start = new Date(now.setDate(now.getDate() - 15));
                end = new Date();
                break;
            case '1_month':
                start = new Date(now.setMonth(now.getMonth() - 1));
                end = new Date();
                break;
            case '3_months':
                start = new Date(now.setMonth(now.getMonth() - 3));
                end = new Date();
                break;
            case '6_months':
                start = new Date(now.setMonth(now.getMonth() - 6));
                end = new Date();
                break;
            case '1_year':
                start = new Date(now.setFullYear(now.getFullYear() - 1));
                end = new Date();
                break;
            default:
                return;
        }

        setStartDate(start);
        setEndDate(end);
        // Also, save these values to localStorage when quick search is used
        localStorage.setItem('startDate', start.toISOString());
        localStorage.setItem('endDate', end.toISOString());
    };

    // Save values to localStorage when they change
    useEffect(() => {
        localStorage.setItem('startDate', startDate.toISOString());
        localStorage.setItem('endDate', endDate.toISOString());
        localStorage.setItem('selectedOption', selectedOption);
        localStorage.setItem('nameFilter', nameFilter);
    }, [startDate, endDate, selectedOption, nameFilter]);


    return (
        <div className=" min-h-screen">
            <div className="flex gap-6 mb-6">
                <div className="flex-auto p-6 bg-white rounded-xl shadow-md ">
                    <h2 className="text-xl font-semibold mb-6">ตัวเลือก</h2>

                    <div className="flex justify-between mb-5">
                        <label htmlFor="">
                            ค้นหาชื่อผู้ขาย
                            <input
                                type="text"
                                placeholder="ชื่อผู้ขาย"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="p-2 border rounded-md mx-2"
                            />
                            <button
                                onClick={fetchData}
                                className="p-3 bg-indigo-500 text-white rounded-md duration-150 hover:bg-indigo-700"
                            >
                                <FaSearch />
                            </button>
                        </label>

                        <label htmlFor="">ย้อนหลัง
                            <select
                                onChange={(e) => handleQuickSearch(e.target.value)}
                                className="p-2 border rounded-md ml-4"
                            >
                                {quickSearchOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-2 items-center">
                            ประเภทข้อมูล
                            <select
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                className="border rounded-md p-2 "
                            >
                                <option value="purchase">รายการซื้อ</option>
                                <option value="sales">รายการขาย</option>
                                <option value="expense">ค่าใช้จ่าย</option>
                            </select>
                        </div>


                        <div className="flex items-center gap-4">

                            <div className="flex items-center gap-4 ">
                                <div className="">วันที่</div>
                                <DatePicker
                                    selected={startDate}
                                    locale="th"
                                    dateFormat="dd/MM/yyyy"
                                    onChange={(date) => setStartDate(date)}
                                    className="p-2 border rounded-md"
                                />
                                ถึง
                                <DatePicker
                                    selected={endDate}
                                    locale="th"
                                    dateFormat="dd/MM/yyyy"
                                    onChange={(date) => setEndDate(date)}
                                    className="p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-6 bg-white rounded-xl shadow-md ">
                    <CardSumData summaryData={summaryData} />
                </div>
            </div>


            <DynamicTable cols={cols} rows={rows} loading={loading} type={selectedOption} />
        </div>
    );
}

export default History;

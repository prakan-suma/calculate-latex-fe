import { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    LineElement,
    CategoryScale,
    LinearScale,
    Title,
    PointElement,
} from "chart.js";

// Registering necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, Title, PointElement);

const Home = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [purchaseAmount, setPurchaseAmount] = useState(0);
    const [salesAmount, setSalesAmount] = useState(0);
    const [expenseAmount, setExpenseAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pieChartData, setPieChartData] = useState(null);
    const [lineChartData, setLineChartData] = useState(null);
    const chartRef = useRef(null);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Fetching data for purchase, sales, and expenses
            const purchaseResponse = await axios.get(
                `https://suma-latex-be.onrender.com/purchases/total-amount?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
            );
            const salesResponse = await axios.get(
                `https://suma-latex-be.onrender.com/sales/total-amount?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
            );
            const expenseResponse = await axios.get(
                `https://suma-latex-be.onrender.com/expense/total-amount?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
            );

            // Data processing
            const totalPurchaseAmount = purchaseResponse.data.reduce((acc, item) => acc + item.totalAmount, 0);
            const totalSalesAmount = salesResponse.data.reduce((acc, item) => acc + item.totalAmount, 0);
            const totalExpenseAmount = expenseResponse.data.reduce((acc, item) => acc + item.totalAmount, 0);

            // Calculate total income
            const totalIncome = totalSalesAmount - (totalPurchaseAmount + totalExpenseAmount);

            setTotalAmount(totalIncome);
            setPurchaseAmount(totalPurchaseAmount);
            setSalesAmount(totalSalesAmount);
            setExpenseAmount(totalExpenseAmount);

            // Pie chart data
            setPieChartData({
                labels: ["ซื้อ", "ค่าใช้จ่าย", "ขาย"],
                datasets: [
                    {
                        data: [totalPurchaseAmount, totalExpenseAmount, totalSalesAmount],
                        backgroundColor: ["#42A5F5", "#FF7043", "#66BB6A"],
                        borderColor: "#fff",
                        borderWidth: 1,
                    },
                ],
            });

            // Line chart data
            const months = purchaseResponse.data.map(item => item.month);
            const purchaseData = purchaseResponse.data.map(item => item.totalAmount);
            const salesData = salesResponse.data.map(item => item.totalAmount);
            const expenseData = expenseResponse.data.map(item => item.totalAmount);

            setLineChartData({
                labels: months,
                datasets: [
                    {
                        label: "ซื้อ",
                        data: purchaseData,
                        fill: false,
                        borderColor: "#42A5F5",
                        tension: 0.1,
                    },
                    {
                        label: "ขาย",
                        data: salesData,
                        fill: false,
                        borderColor: "#66BB6A",
                        tension: 0.1,
                    },
                    {
                        label: "ค่าใช้จ่าย",
                        data: expenseData,
                        fill: false,
                        borderColor: "#FF7043",
                        tension: 0.1,
                    },
                ],
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const now = new Date();
        const defaultStartDate = new Date(now.setMonth(now.getMonth() - 3));
        setStartDate(defaultStartDate);
        setEndDate(new Date());
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchReportData();
        }
    }, [startDate, endDate]);

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
    };

    const quickSearchOptions = [
        { label: '---เลือกย้อนหลัง---', value: null },
        { label: 'ปัจจุบัน', value: 'today' },
        { label: 'ย้อนหลัง 15 วัน', value: 'last_15_days' },
        { label: '1 เดือน', value: '1_month' },
        { label: '3 เดือน', value: '3_months' },
        { label: '6 เดือน', value: '6_months' },
        { label: '1 ปี', value: '1_year' },
    ];

    const formatNumber = (number) => {
        return number.toLocaleString();
    };

    return (
        <div className="min-h-screen">
            <div className="p-6 rounded-xl bg-slate-50 shadow-md">
                <h1 className="text-2xl font-semibold mb-6">สรุปรายได้</h1>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label htmlFor="quick-search" className="text-lg mr-4">เลือกช่วงเวลา</label>
                        <select
                            id="quick-search"
                            onChange={(e) => handleQuickSearch(e.target.value)}
                            className="p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            {quickSearchOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-lg">ตั้งแต่วันที่
                        <DatePicker
                            selected={startDate}
                            locale="th"
                            dateFormat="dd/MM/yyyy"
                            onChange={(date) => setStartDate(date)}
                            className="ml-4 p-2 border rounded-md shadow-sm"
                        />
                    </div>

                    <div className="text-lg">ถึงวันที่
                        <DatePicker
                            selected={endDate}
                            locale="th"
                            dateFormat="dd/MM/yyyy"
                            onChange={(date) => setEndDate(date)}
                            className="ml-4 p-2 border rounded-md shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-xl">กำลังโหลด...</div>
            ) : (
                <div className="flex flex-wrap gap-6 mt-6">
                    {/* Text Data for Purchase, Sales, Expense */}
                    <div className="h-fit flex flex-col p-6 bg-slate-50 rounded-xl shadow-md">
                        <div className={`text-2xl font-semibold mb-4 `}>
                            รายได้รวม: <span className="text-indigo-500">{totalAmount !== null ? formatNumber(totalAmount) : 0}</span> บาท
                        </div>
                        <p className="text-lg">
                            <strong>ซื้อ:</strong> {formatNumber(purchaseAmount)} บาท
                        </p>
                        <p className="text-lg">
                            <strong>รายจ่าย:</strong> {formatNumber(expenseAmount)} บาท
                        </p>
                        <p className="text-lg">
                            <strong>รายได้:</strong> {formatNumber(salesAmount)} บาท
                        </p>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-xl shadow-md">
                        {/* Pie Chart Display */}
                        {pieChartData && (
                            <div className="w-96">
                                <Pie data={pieChartData} />
                            </div>
                        )}
                    </div>

                    <div className="p-6 flex-1 bg-slate-50 rounded-xl shadow-md">
                        {/* Line Chart Display */}
                        {lineChartData && (
                            <div className="w-full">
                                <Line ref={chartRef} data={lineChartData} />
                            </div>
                        )}
                    </div>


                </div>
            )}
        </div>
    );
};

export default Home;

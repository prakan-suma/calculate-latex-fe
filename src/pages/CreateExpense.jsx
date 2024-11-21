import { useState, useEffect } from 'react';
import { CiSaveDown2 } from "react-icons/ci";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from 'date-fns/locale';
import AlertPopup from '../components/AlertPopup';
import { useLoading } from '../contexts/LoadingContext';


function CreateExpense() {
    // loading 
    const { showLoading, hideLoading } = useLoading();

    const [note, setNote] = useState('');
    const [amount, setAmount] = useState('');
    const [alert, setAlert] = useState(null);
    const [currentDate, setCurrentDate] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        setCurrentDate(formattedDate);
    }, []);

    const handleSaveExpense = async () => {
        if (!note || !amount) {
            setAlert({ message: 'กรอกข้อมูลให้ครบถ้วน!', type: 'warning' });
            return
        }

        const expenseData = {
            date: selectedDate.toISOString().split('T')[0],
            note,
            amount: parseFloat(amount),
        };

        showLoading();

        try {
            const response = await fetch('http://127.0.0.1:8000/expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData),
            });

            if (response.ok) {
                setAlert({ message: 'บันทึกข้อมูลเรียบร้อยแล้ว', type: 'success' });
                setNote('');
                setAmount('');
                setSelectedDate(new Date()); // รีเซ็ตวันที่
            } else {
                setAlert({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
            }
        } catch (error) {
            console.error('Error:', error);
            setAlert({ message: 'ไม่สามารถเชื่อมต่อกับ Server ได้', type: 'error' });
        } finally {
            hideLoading();
        }

    };

    return (
        <div className="p-6 py-14 bg-white border shadow-sm rounded-xl max-w-xl mx-auto">
            {alert && <AlertPopup message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}


            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">บันทึกค่าใช้จ่าย</h3>
                <p>วันที่: {currentDate}</p>
            </div>

            {/* ฟอร์มบันทึกค่าใช้จ่าย */}
            <div className="space-y-4">
                {/* ช่องกรอกหมายเหตุ */}
                <div className="flex justify-between items-center">
                    <label>หมายเหตุ:</label>
                    <input
                        type='text'
                        className="text-end p-1 rounded-md border w-2/3"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="กรอกหมายเหตุ"
                    />
                </div>

                {/* ช่องกรอกจำนวนเงิน */}
                <div className="flex justify-between items-center">
                    <label>จำนวนเงิน:</label>
                    <input
                        type="number"
                        className="text-end p-1 rounded-md border w-2/3"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                {/* ช่องเลือกวันที่ */}
                <div className="flex justify-between items-center">
                    <label>เลือกวันที่:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd" // กำหนดรูปแบบวันที่
                        locale={th} // ใช้ภาษาไทย
                        portalId="root-portal"
                        className="p-1 rounded-md border text-right"
                    />
                </div>

                {/* ปุ่มบันทึกข้อมูล */}
                <button
                    className="flex items-center justify-center mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md duration-150"
                    onClick={handleSaveExpense}
                >
                    <CiSaveDown2 className='mr-4' size={20} />
                    บันทึกค่าใช้จ่าย
                </button>
            </div>
        </div>
    );
}

export default CreateExpense;

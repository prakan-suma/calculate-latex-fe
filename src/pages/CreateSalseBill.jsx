import { useState, useEffect } from 'react';
import { LuPrinter } from 'react-icons/lu';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';
import { CiSaveDown2 } from "react-icons/ci";
import AlertPopup from '../components/AlertPopup';
import { useLoading } from '../contexts/LoadingContext';

registerLocale('th', th);

function CreateSalesBill() {
    // loading 
    const { showLoading, hideLoading } = useLoading();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [totalDryRubberWeight, setTotalDryRubberWeight] = useState(0);
    const [pricePurchase, setPricePurchase] = useState('');
    const [serviceCharge, setServiceCharge] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [currentDate, setCurrentDate] = useState('');
    const [alert, setAlert] = useState(null);


    useEffect(() => {
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];
        setCurrentDate(formattedDate);
    }, []);


    const formatNumber = (number) => {
        return number.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const fetchTotalDryRubberWeight = async () => {
        if (startDate && endDate) {

            showLoading();
            try {
                const start = startDate.toISOString().split('T')[0];
                const end = endDate.toISOString().split('T')[0];

                const response = await fetch(
                    `https://suma-latex-be.onrender.com/total-dry-rubber?start_date=${start}&end_date=${end}`
                );

                const data = await response.json();

                setTotalDryRubberWeight(data.total_dry_rubber_weight || 0);
            } catch (error) {
                console.error('Error fetching total rubble:', error);
                setTotalDryRubberWeight(0);
            } finally {
                hideLoading()
            }
        }
    };

    useEffect(() => {
        if (totalDryRubberWeight && pricePurchase) {
            const subtotal = totalDryRubberWeight * parseFloat(pricePurchase);
            const calculatedServiceCharge = (subtotal * 0.50) / 100;
            setServiceCharge(calculatedServiceCharge);
            setTotalAmount(subtotal + calculatedServiceCharge);
        } else {
            setServiceCharge(0);
            setTotalAmount(0);
        }
    }, [totalDryRubberWeight, pricePurchase]);

    const handleSave = async () => {
        if (!totalDryRubberWeight || !pricePurchase || !serviceCharge || !totalAmount) {
            setAlert({ message: 'กรอกข้อมูลให้ครบถ้วน!', type: 'warning' });
            return;
        }

        const data = {
            date: currentDate,
            totalDryRubberWeight,
            pricePurchase,
            serviceCharge,
            totalAmount,
        };


        showLoading();
        try {
            const response = await fetch(`https://suma-latex-be.onrender.com/sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setAlert({ message: 'บันทึกข้อมูลเรียบร้อยแล้ว', type: 'success' });
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

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write('<html><head><title>Print Receipt</title>');

        printWindow.document.write(`
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }

            @media print {
              body {
                font-size: 1rem;
                width: 58mm;
                margin: 0;
                padding: 4mm;
                // font-family: 'PS LCD Matrix II Regular', 'Arial', sans-serif;
              }

              .label{
              font-size: 0.8rem;
              }
              .print-content {
                width: 100%;
              }
              .divider {
                border-top: 1px solid black;
                margin: 2mm 0;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .receipt-item {
               
                display: flex;
                justify-content: space-between;
                margin: 1mm 0;
              }
            }
          </style>
        `);

        printWindow.document.write('</head><body>');

        printWindow.document.write(`
            <div class="print-content">
              <div class="text-center">
                <h3 class="font-bold">SUMA LATEX APP</h3>
                <p>ใบเสร็จรับเงิน</p>
                <p>วันที่: ${currentDate}</p>
              </div>
              <div class="divider"></div>
              <div class="receipt-item">
                <span class="label">ยางแห้ง:</span>
                <span>${formatNumber(totalDryRubberWeight)} กก.</span>
              </div>
       
              <div class="receipt-item">
                <span class="label" >รับซื้อ:</span>
                <span>${formatNumber(pricePurchase)} บ.</span>
              </div>

                 <div class="receipt-item">
                <span class="label">ค่าบริการ:</span>
                <span>${formatNumber(serviceCharge)} บ.</span>
              </div>

              <div class="divider"></div>
              <div class="receipt-item font-bold">
                <span class="label" >ยอดเงินสุทธิ:</span>
                <span>${totalAmount.toLocaleString()}  บ.</span>
              </div>
              <div class="text-center" style="margin-top: 4mm">
            </div>
          `);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };


    return (
        <div className="p-6 py-14 bg-white border shadow-sm rounded-xl max-w-xl mx-auto">
            {alert && <AlertPopup message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">สร้างบิลขายออก</h3>
                <h3 className="text-lg font-semibold mt-4">SUMA LATEX</h3>
                <p>วันที่: {currentDate}</p>
            </div>

            {/* ฟิลเตอร์วันที่ */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label>วันที่เริ่มต้น:</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        locale="th"
                        dateFormat="dd/MM/yyyy"
                        className="text-end p-1 rounded-md border "
                        portalId="root-portal"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <label>วันที่สิ้นสุด:</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        locale="th"
                        dateFormat="dd/MM/yyyy"
                        className="text-end p-1 rounded-md border "
                        portalId="root-portal"
                    />
                </div>

                <button
                    className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-md duration-150"
                    onClick={fetchTotalDryRubberWeight}
                >
                    คำนวณน้ำหนักยางสุทธิ
                </button>

                {/* แสดงผล Total Rubble */}
                <div className="flex justify-between items-center mt-4">
                    <label>น้ำหนักยางสุทธิ:</label>
                    <p>{formatNumber(totalDryRubberWeight)} กก.</p>
                </div>

                {/* ช่องกรอกราคารับซื้อ */}
                <div className="flex justify-between items-center mt-4">
                    <label>ราคารับซื้อ:</label>
                    <input
                        type="number"
                        className="text-end p-1 rounded-md border w-2/3"
                        value={pricePurchase}
                        onChange={(e) => setPricePurchase(e.target.value)}
                    />
                </div>

                {/* แสดงผลค่าบริการ */}
                <div className="flex justify-between items-center mt-4">
                    <label>ค่าบริการ:</label>
                    <p>{formatNumber(serviceCharge)} บาท</p>
                </div>

                {/* แสดงผลยอดรวม */}
                <div className="flex justify-between items-center mt-4 font-bold">
                    <label>ยอดเงินสุทธิ:</label>
                    <p>{totalAmount.toLocaleString()} บาท</p>
                </div>

                <div className="flex gap-4">
                    <button
                        className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-md flex items-center justify-center duration-150"
                        onClick={handleSave}
                    >
                        <CiSaveDown2 className="mr-2" size={20} />
                        บันทึกข้อมูล
                    </button>
                    {/* ปุ่มพิมพ์ใบเสร็จ */}
                    <button
                        className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md flex items-center justify-center duration-150"
                        onClick={handlePrint}
                    >
                        <LuPrinter className="mr-2" />
                        พิมพ์ใบเสร็จ
                    </button>
                </div>

            </div>
        </div>
    );
}

export default CreateSalesBill;

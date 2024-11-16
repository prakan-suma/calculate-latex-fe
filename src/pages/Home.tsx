import { useState, useEffect, useRef } from 'react';
import { MdOutlineDeleteSweep } from "react-icons/md";
import { LuPrinter } from "react-icons/lu";

function Home() {
    const [name, setName] = useState('');
    const [rubberWeight, setRubberWeight] = useState<number>(0);
    const [tankWeight, setTankWeight] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);
    const [buyingPrice, setBuyingPrice] = useState<number>(() => {
        const savedPrice = localStorage.getItem('buyingPrice');
        return savedPrice ? parseInt(savedPrice, 10) : 50; // ค่าเริ่มต้น
    });

    const [dryRubberWeight, setDryRubberWeight] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const printRef = useRef<HTMLDivElement>(null);

    // คำนวณยางแห้งและยอดเงินเมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        if (rubberWeight && tankWeight && percentage && buyingPrice) {
            const netWeight = rubberWeight - tankWeight;
            const dryWeight = parseFloat(((netWeight * (percentage / 100)).toFixed(1))); // ใช้ทศนิยมตัวเดียว
            const amount = dryWeight * buyingPrice;

            setDryRubberWeight(dryWeight);
            setTotalAmount(amount);
        } else {
            setDryRubberWeight(0);
            setTotalAmount(0);
        }
    }, [rubberWeight, tankWeight, percentage, buyingPrice]);

    // ล้างข้อมูล
    const clearData = () => {
        setName('');
        setRubberWeight(0);
        setTankWeight(0);
        setPercentage(0);
        setDryRubberWeight(0);
        setTotalAmount(0);
    };

    // บันทึกราคารับซื้อล่าสุดลง localStorage
    useEffect(() => {
        localStorage.setItem('buyingPrice', buyingPrice.toString());
    }, [buyingPrice]);

    // ฟังก์ชันสำหรับการพิมพ์
    const handlePrint = () => {
        if (printRef.current) {
            const printContents = printRef.current.innerHTML;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(`
                    <html>
                    <head>
                        <style>
                            @media print {
                                body {
                                    width: 57mm;
                                    font-family: Arial, sans-serif;
                                    font-size: 12px;
                                }
                                .receipt {
                                    width: 100%;
                                }
                                .receipt-header {
                                    text-align: center;
                                    margin-bottom: 10px;
                                    border-bottom: 1px dashed #000;
                                }
                                .receipt-content {
                                    margin-bottom: 10px;
                                }
                                .receipt-footer {
                                    text-align: center;
                                    margin-top: 10px;
                                    border-top: 1px dashed #000;
                                }
                            }
                        </style>
                    </head>
                    <body onload="window.print();window.close()">
                        ${printContents}
                    </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    const formatNumber = (num: number) => num.toLocaleString();

    return (
        <>
            <h3 className="flex justify-center text-2xl font-semibold">สร้างรายการใหม่</h3>
            <div className="max-w-prose mx-auto">
                <div className="flex justify-center my-12 gap-6">
                    <div className="w-1/2">
                        <label className="flex flex-col">
                            <p>ชื่อ <span className="text-red-600 font-bold">*</span></p>
                            <input
                                className="rounded-md p-2 border-slate-300 border"
                                placeholder="กรอกชื่อผู้ขาย"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                        <label className="flex flex-col">
                            <p>น้ำหนักยาง <span className="text-red-600 font-bold">*</span></p>
                            <input
                                className="rounded-md p-2 border-slate-300 border"
                                placeholder="กรอกน้ำหนักยาง"
                                type="number"
                                value={rubberWeight === 0 ? '' : rubberWeight}
                                onChange={(e) => setRubberWeight(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                        </label>
                        <label className="flex flex-col">
                            <p>น้ำหนักถัง <span className="text-red-600 font-bold">*</span></p>
                            <input
                                className="rounded-md p-2 border-slate-300 border"
                                placeholder="กรอกน้ำหนักถัง"
                                type="number"
                                value={tankWeight === 0 ? '' : tankWeight}
                                onChange={(e) => setTankWeight(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                        </label>
                        <label className="flex flex-col">
                            <p>เปอร์เซ็นต์ยางแห้ง <span className="text-red-600 font-bold">*</span></p>
                            <input
                                className="rounded-md p-2 border-slate-300 border"
                                placeholder="กรอกเปอร์เซ็นต์"
                                type="number"
                                value={percentage === 0 ? '' : percentage}
                                onChange={(e) => setPercentage(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                        </label>
                    </div>

                    <div ref={printRef} className="receipt">
                        <div className="receipt-header">
                            <h4>ใบเสร็จรับเงิน</h4>
                        </div>
                        <div className="receipt-content">
                            <p>ชื่อ: {name}</p>
                            <p>น้ำหนักยาง: {formatNumber(rubberWeight)} กก.</p>
                            <p>น้ำหนักถัง: {formatNumber(tankWeight)} กก.</p>
                            <p>ยางแห้ง: {formatNumber(dryRubberWeight)} กก.</p>
                            <p>ราคารับซื้อ: {formatNumber(buyingPrice)} บาท</p>
                            <p>ยอดเงินสุทธิ: {formatNumber(totalAmount)} บาท</p>
                        </div>
                        <div className="receipt-footer">
                            <p>ขอบคุณที่ใช้บริการ</p>
                        </div>
                    </div>
                </div>

                <button className="bg-blue-500 text-white p-2 rounded" onClick={handlePrint}>
                    <LuPrinter className="inline-block mr-2" /> ปริ้นใบเสร็จ
                </button>
            </div>
        </>
    );
}

export default Home;

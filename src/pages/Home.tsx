import { useState, useEffect, useRef } from 'react';
import { LuPrinter } from "react-icons/lu";

function Home() {
    const [name, setName] = useState('');
    const [rubberWeight, setRubberWeight] = useState<number>(0);
    const [tankWeight, setTankWeight] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);
    const [buyingPrice, setBuyingPrice] = useState<number>(() => {
        const savedPrice = localStorage.getItem('buyingPrice');
        return savedPrice ? parseFloat(savedPrice) : 50;
    });

    const [netWeight, setNetWeight] = useState<number>(0);
    const [dryRubberWeight, setDryRubberWeight] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [currentDate, setCurrentDate] = useState<string>('');

    const printRef = useRef<HTMLDivElement>(null);

    // ฟังก์ชันตัดทศนิยมให้เหลือ 1 ตำแหน่งโดยไม่ปัดเศษ
    const truncateToOneDecimal = (num: number): number => {
        const numStr = num.toString();
        const decimalIndex = numStr.indexOf('.');
        if (decimalIndex === -1) return num;
        return parseFloat(numStr.slice(0, decimalIndex + 2));
    };

    // คำนวณยางแห้งและยอดเงินเมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        if (rubberWeight && tankWeight && percentage && buyingPrice) {
            // คำนวณน้ำหนักสุทธิและตัดทศนิยม
            const calculatedNetWeight = truncateToOneDecimal(rubberWeight - tankWeight);
            setNetWeight(calculatedNetWeight);

            // คำนวณเปอร์เซ็นต์และตัดทศนิยม
            const truncatedPercentage = truncateToOneDecimal(percentage);

            // คำนวณยางแห้งและตัดทศนิยม
            const dryWeight = truncateToOneDecimal(calculatedNetWeight * (truncatedPercentage / 100));

            // ตัดทศนิยมราคารับซื้อ
            const truncatedPrice = truncateToOneDecimal(buyingPrice);

            // คำนวณยอดเงินและตัดทศนิยม
            const amount = truncateToOneDecimal(dryWeight * truncatedPrice);

            setDryRubberWeight(dryWeight);
            setTotalAmount(amount);
        } else {
            setNetWeight(0);
            setDryRubberWeight(0);
            setTotalAmount(0);
        }
    }, [rubberWeight, tankWeight, percentage, buyingPrice]);

    useEffect(() => {
        const date = new Date();
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        setCurrentDate(formattedDate);
    }, []);

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>พิมพ์ใบเสร็จ</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                background-color: #fff;
                            }
                            .receipt {
                                width: 100%; /* ปรับให้เต็มหน้ากระดาษ */
                                max-width: 500px; /* กำหนดความกว้างสูงสุดของใบเสร็จ */
                                font-family: Arial, sans-serif;
                                font-size: 8pt;
                                line-height: 1.2;
                                padding: 2px; /* เพิ่ม padding เพื่อไม่ให้ตัวอักษรติดขอบ */
                                box-sizing: border-box; /* ให้การคำนวณ padding เข้ากับความกว้าง */
                            }
                            .receipt-header {
                                text-align: center;
                                font-size: 8pt;
                                font-weight: bold;
                            }
                            .receipt-footer {
                                text-align: center;
                                font-size: 8pt;
                            }
                            .calculation-step {
                                margin: 5px 0;
                                border-top: 1px dashed #ccc;
                                padding-top: 5px;
                            }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        <div class="receipt">
                            ${printRef.current.innerHTML}
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('th-TH').format(num);
    };

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
                        <label className="flex flex-col">
                            <p>ราคารับซื้อ <span className="text-red-600 font-bold">*</span></p>
                            <input
                                className="rounded-md p-2 border-slate-300 border"
                                placeholder="กรอกราคารับซื้อ"
                                type="number"
                                value={buyingPrice === 0 ? '' : buyingPrice}
                                onChange={(e) => setBuyingPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                            />
                        </label>
                    </div>

                    <div ref={printRef} className="receipt">
                        <div className="receipt-header">
                            <h4>ใบเสร็จรับเงิน</h4>
                            <p>วันที่: {currentDate}</p>
                        </div>
                        <div className="receipt-content">
                            <p>ชื่อ: {name}</p>
                            <br />
                            <div className="calculation-step">
                                <p>น้ำหนักยาง: <span className="number">{formatNumber(rubberWeight)}</span> กก.</p>
                                <p>น้ำหนักถัง: <span className="number">{formatNumber(tankWeight)}</span> กก.</p>
                                <p>น้ำหนักสุทธิ: <span className="number">{formatNumber(netWeight)}</span> กก.</p>
                            </div>

                            <div className="calculation-step">
                                <p>เปอร์เซ็นต์ยาง: <span className="number">{formatNumber(percentage)}</span> %</p>
                                <p>ยางแห้ง: <span className="number">{formatNumber(dryRubberWeight)}</span> กก.</p>
                            </div>

                            <div className="calculation-step">
                                <p>ราคารับซื้อ: <span className="number">{formatNumber(buyingPrice)}</span> บาท/กก.</p>
                                <p>ยอดเงินสุทธิ: <span className="number">{formatNumber(totalAmount)}</span> บาท</p>
                            </div>
                        </div>
                        <br />
                        <div className="receipt-footer">
                            <p>ขอบคุณที่ใช้บริการ （〃｀ 3′〃）</p>
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
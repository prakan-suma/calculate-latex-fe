import { useState, useEffect, useRef } from 'react';
import { LuPrinter } from 'react-icons/lu';

function Home() {
    const [name, setName] = useState('');
    const [rubberWeight, setRubberWeight] = useState(0);
    const [tankWeight, setTankWeight] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [buyingPrice, setBuyingPrice] = useState(() => {
        const savedPrice = localStorage.getItem('buyingPrice');
        return savedPrice ? parseFloat(savedPrice) : 50;
    });

    const [netWeight, setNetWeight] = useState(0);
    const [dryRubberWeight, setDryRubberWeight] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [currentDate, setCurrentDate] = useState('');

    const printRef = useRef(null);

    const truncateToOneDecimal = (num) => {
        const numStr = num.toString();
        const decimalIndex = numStr.indexOf('.');
        if (decimalIndex === -1) return num;
        return parseFloat(numStr.slice(0, decimalIndex + 2));
    };

    useEffect(() => {
        if (rubberWeight && tankWeight && percentage && buyingPrice) {
            const calculatedNetWeight = truncateToOneDecimal(rubberWeight - tankWeight);
            setNetWeight(calculatedNetWeight);

            const truncatedPercentage = truncateToOneDecimal(percentage);
            const dryWeight = truncateToOneDecimal(calculatedNetWeight * (truncatedPercentage / 100));
            const truncatedPrice = truncateToOneDecimal(buyingPrice);
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
                                width: 100%;
                                max-width: 500px;
                                font-family: Arial, sans-serif;
                                font-size: 8pt;
                                line-height: 1.2;
                                padding: 2px;
                                box-sizing: border-box;
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

    // ฟังก์ชันสำหรับพิมพ์ผ่าน Bluetooth Printer
    const handleBluetoothPrint = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['printer'] }]
            });
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('printer');
            const characteristic = await service.getCharacteristic('write');

            const receiptText = `
                ใบเสร็จรับเงิน
                วันที่: ${currentDate}
                ชื่อ: ${name}
                น้ำหนักสุทธิ: ${netWeight} กก.
                ยางแห้ง: ${dryRubberWeight} กก.
                ยอดเงินสุทธิ: ${totalAmount} บาท
            `;
            const encoder = new TextEncoder();
            const data = encoder.encode(receiptText);
            await characteristic.writeValue(data);
            alert("พิมพ์ผ่าน Bluetooth สำเร็จ!");
        } catch (error) {
            console.error('Bluetooth Print Error:', error);
            alert('ไม่สามารถพิมพ์ผ่าน Bluetooth ได้');
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('th-TH').format(num);
    };

    return (
        <>
            <h3 className="flex justify-center text-2xl font-semibold">สร้างรายการใหม่</h3>
            <div className="max-w-prose mx-auto">
                <div className="flex justify-center my-12 gap-6">
                    <div className="w-1/2">
                        <label className="flex flex-col">
                            <p>ชื่อ</p>
                            <input
                                className="rounded-md p-2 border-slate-300 border"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                    </div>

                    <div ref={printRef} className="receipt">
                        <h4>ใบเสร็จรับเงิน</h4>
                        <p>วันที่: {currentDate}</p>
                        <p>น้ำหนักสุทธิ: {formatNumber(netWeight)} กก.</p>
                        <p>ยางแห้ง: {formatNumber(dryRubberWeight)} กก.</p>
                        <p>ยอดเงินสุทธิ: {formatNumber(totalAmount)} บาท</p>
                    </div>
                </div>

                <button className="bg-blue-500 text-white p-2 rounded" onClick={handlePrint}>
                    <LuPrinter className="inline-block mr-2" /> ปริ้นใบเสร็จ
                </button>

                <button className="bg-green-500 text-white p-2 rounded ml-4" onClick={handleBluetoothPrint}>
                    <LuPrinter className="inline-block mr-2" /> ปริ้นผ่าน Bluetooth
                </button>
            </div>
        </>
    );
}

export default Home;

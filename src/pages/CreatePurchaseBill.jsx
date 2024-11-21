import { useState, useEffect } from 'react';
import { LuPrinter } from 'react-icons/lu';
import { CiSaveDown2 } from "react-icons/ci";
import AlertPopup from '../components/AlertPopup';
import { useLoading } from '../contexts/LoadingContext';

function CreatePurchaseBill() {
    // loading 
    const { showLoading, hideLoading } = useLoading();

    const [name, setName] = useState('');
    const [rubberWeight, setRubberWeight] = useState('');
    const [tankWeight, setTankWeight] = useState('');
    const [percentage, setPercentage] = useState('');
    const [buyingPrice, setBuyingPrice] = useState(() => {
        const savedPrice = localStorage.getItem('buyingPrice');
        return savedPrice ? savedPrice : '50';
    });
    const [netWeight, setNetWeight] = useState(0);
    const [dryRubberWeight, setDryRubberWeight] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [currentDate, setCurrentDate] = useState('');
    const [alert, setAlert] = useState(null);

    const [noteAmount, setNoteAmount] = useState(0);
    const [noteOption, setNoteOption] = useState('');

    const [totalNetAmount, setTotalNetAmount] = useState(0);


    useEffect(() => {
        let netAmount = totalAmount;

        if (noteOption === 'หัก') {
            netAmount = totalAmount - parseFloat(noteAmount || 0);
        } else if (noteOption === 'บวก') {
            netAmount = totalAmount + parseFloat(noteAmount || 0);
        } else if (noteOption === 'หาร 2 คน') {
            const halfAmount = totalAmount / 2;
            setNoteAmount(Number(halfAmount.toFixed(2)));
        } else if (noteOption === 'โอน') {
            netAmount = totalAmount - parseFloat(noteAmount || 0);
        } else {
            setNoteAmount(0)
            setTotalAmount(totalAmount)
            setTotalNetAmount(totalAmount)
        }

        setTotalNetAmount(Number(netAmount.toFixed(2)));
    }, [totalAmount, noteOption, noteAmount]);

    const truncateToOneDecimal = (number) => {
        const stringNum = number.toString();
        const decimalIndex = stringNum.indexOf('.');
        if (decimalIndex === -1) return number;
        return parseFloat(stringNum.slice(0, decimalIndex + 2));
    };


    const formatNumber = (number) => {
        return number.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    useEffect(() => {
        if (rubberWeight && tankWeight && percentage && buyingPrice) {
            const truncatedRubberWeight = truncateToOneDecimal(parseFloat(rubberWeight));
            const truncatedTankWeight = truncateToOneDecimal(parseFloat(tankWeight));

            const calculatedNetWeight = truncatedRubberWeight - truncatedTankWeight;
            setNetWeight(Number(calculatedNetWeight.toFixed(2)));

            const truncatedPercentage = truncateToOneDecimal(parseFloat(percentage));
            const dryWeight = calculatedNetWeight * (truncatedPercentage / 100);
            const truncatedDryWeight = truncateToOneDecimal(dryWeight);
            setDryRubberWeight(Number(truncatedDryWeight.toFixed(2)));

            const truncatedPrice = truncateToOneDecimal(parseFloat(buyingPrice));
            const amount = truncatedDryWeight * truncatedPrice;
            setTotalAmount(Number(amount.toFixed(2)));
        } else {
            setNetWeight(0);
            setDryRubberWeight(0);
            setTotalAmount(0);
        }
    }, [rubberWeight, tankWeight, percentage, buyingPrice]);

    useEffect(() => {
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];
        setCurrentDate(formattedDate);
    }, []);

    const handleSave = async () => {

        if (!name || !rubberWeight || !tankWeight || !percentage || !dryRubberWeight || !buyingPrice || !netWeight || !totalAmount) {
            setAlert({ message: 'กรอกข้อมูลให้ครบถ้วน!', type: 'warning' });
            return;
        }

        const adjustedAmount =
            noteOption === 'หัก'
                ? totalAmount - parseFloat(noteAmount || 0)
                : noteOption === 'บวก'
                    ? totalAmount + parseFloat(noteAmount || 0)
                    : totalAmount;

        const data = {
            date: currentDate,
            name,
            rubberWeight,
            tankWeight,
            percentage,
            dryRubberWeight,
            buyingPrice,
            netWeight,
            totalAmount: adjustedAmount,
            note: noteOption,
            noteAmount,
        };

        console.log(data)
        showLoading();

        try {
            const response = await fetch(`http://localhost:8000/purchase`, {
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
                width: 58mm;
                margin: 0;
                font-size: 1rem;
                padding: 4mm;
                font-family: 'Sarabun', Arial, sans-serif;
              }
              .print-content {
                width: 100%;
              }

              .label{
                font-size:0.8rem
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

        const noteSection =
            noteOption !== "" && noteAmount
                ? `
                <div class="receipt-item">
                    <span class="label">ยอดเงิน:</span>
                    <span>${totalAmount.toLocaleString()} บ.</span>
                </div>
                <div class="receipt-item">
                    <span class="label">${noteOption}:</span>
                    <span>${Number(noteAmount).toLocaleString()} บ.</span>
                </div>`
                : '';

        printWindow.document.write(`
            <div class="print-content">
              <div class="text-center">
                <h3 class="font-bold">SUMA LATEX APP</h3>
                <p>ใบเสร็จรับเงิน</p>
                <p>วันที่: ${currentDate}</p>
              </div>
              <div class="divider"></div>
              <div class="receipt-item">
                <span class="label">ชื่อ:</span>
                <span>${name}</span>
              </div>
              <div class="receipt-item">
                <span class="label">น้ำหนักยาง:</span>
                <span>${formatNumber(parseFloat(rubberWeight))} กก.</span>
              </div>
              <div class="receipt-item">
                <span class="label">น้ำหนักถัง:</span>
                <span>${formatNumber(parseFloat(tankWeight))} กก.</span>
              </div>
              <div class="receipt-item">
                <span class="label">คงเหลือ:</span>
                <span>${formatNumber(netWeight)} กก.</span>
              </div>
              <div class="receipt-item">
                <span class="label">%:</span>
                <span>${percentage}%</span>
              </div>
              <div class="receipt-item">
                <span class="label">ยางแห้ง:</span>
                <span>${formatNumber(dryRubberWeight)} กก.</span>
              </div>
              <div class="receipt-item">
                <span class="label">รับซื้อ:</span>
                <span>${buyingPrice} บ.</span>
              </div>
              <div class="divider"></div>
              ${noteSection} <!-- เพิ่มส่วนนี้ -->
              <div class="receipt-item font-bold">
                <span class="label">ยอดเงินสุทธิ:</span>
                <span>${totalNetAmount.toLocaleString()} บ.</span>
              </div>
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
                <h3 className="text-xl font-semibold">สร้างบิลรับซื้อ</h3>
                <h3 className="text-lg font-semibold mt-4">SUMA LATEX</h3>
                <p>ใบเสร็จรับเงิน</p>
                <p>วันที่: {currentDate}</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label>ชื่อ:</label>
                    <input
                        className="text-end p-1 rounded-md border w-2/3"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <label>น้ำหนักยาง:</label>
                    <input
                        className="text-end p-1 rounded-md border w-2/3"
                        type="number"
                        value={rubberWeight}
                        onChange={(e) => setRubberWeight(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <label>น้ำหนักถัง:</label>
                    <input
                        className="text-end p-1 rounded-md border w-2/3"
                        type="number"
                        value={tankWeight}
                        onChange={(e) => setTankWeight(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <label>น้ำหนักคงเหลือ:</label>
                    <p>{formatNumber(netWeight)} กก.</p>
                </div>

                <div className="flex justify-between items-center">
                    <label>เปอร์เซ็นยางแห้ง:</label>
                    <input
                        className="text-end p-1 rounded-md border w-2/3"
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <label>น้ำหนักยางแห้ง:</label>
                    <p>{formatNumber(dryRubberWeight)} กก.</p>
                </div>


                <div className="flex justify-between items-center">
                    <label>ราคารับซื้อ:</label>
                    <input
                        className="text-end p-1 rounded-md border w-2/3"
                        type="number"
                        value={buyingPrice}
                        onChange={(e) => setBuyingPrice(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <label>ยอดเงินสุทธิ:</label>
                    <p>{formatNumber(totalNetAmount)} บาท</p>
                </div>


                <div className="text-center">--- เพิ่มเติม ---</div>

                <div className="flex justify-center gap-4 items-center">
                    <select
                        className=" p-1 rounded-md border "
                        value={noteOption}
                        onChange={(e) => setNoteOption(e.target.value)}
                    >
                        <option value="">--เพิ่มเติม--</option>
                        <option value="โอน">โอน</option>
                        <option value="หาร 2 คน">หาร 2 คน</option>
                        <option value="หัก">หัก</option>
                        <option value="บวก">บวก</option>

                    </select>
                    <div className="flex justify-between items-center gap-2">
                        <input
                            className="text-end p-1 rounded-md border"
                            type="number"
                            value={noteAmount}
                            onChange={(e) => setNoteAmount(e.target.value)}
                            disabled={noteOption === 'หาร 2 คน'}
                        />
                        <div className="">
                            บาท
                        </div>
                    </div>
                </div>




            </div>

            <div className="flex gap-4 mt-12">
                <button
                    className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 duration-150 text-white py-2 rounded-md"
                    onClick={handleSave}
                >
                    <CiSaveDown2 className='mr-2' size={20} />
                    บันทึกข้อมูล
                </button>

                <button
                    className="w-full bg-indigo-500 hover:bg-indigo-700 text-white py-2 rounded-md flex items-center justify-center duration-150"
                    onClick={handlePrint}
                >
                    <LuPrinter className="mr-2" />
                    พิมพ์ใบเสร็จ
                </button>
            </div>
        </div>
    );
}

export default CreatePurchaseBill;
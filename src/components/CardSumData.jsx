
// eslint-disable-next-line react/prop-types
function CardSumData({ summaryData }) {

    const formatNumber = (number) => {
        return number.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    return (
        <div>
            {summaryData ? (
                <div className="">
                    {Object.keys(summaryData).map((key) => (
                        <div key={key} className=" ">
                            <p className="text-gray-700">{key}</p>
                            <h3 className="text-2xl font-bold text-indigo-500">{formatNumber(summaryData[key])}
                            </h3>

                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 mt-4">ไม่มีข้อมูลสรุป</p>
            )}
        </div>
    );
}

export default CardSumData;

const CardInfo = ({ icon: Icon, amount, details }) => {
    return (
        <>
            <div className="flex flex-col gap-3 border p-6 rounded-2xl shadow-sm bg-slate-50">
                <Icon size={34} />
                <h2 className="overflow-hidden text-2xl font-semibold text-indigo-600 whitespace-nowrap text-ellipsis">
                    {amount} บาท
                </h2>
                <p className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                    {details}
                </p>
            </div>
        </>
    );
};

export default CardInfo;

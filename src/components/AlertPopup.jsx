import { CgClose } from "react-icons/cg";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import { TbFaceIdError } from "react-icons/tb";

function AlertPopup({ message, type, onClose }) {

    // เลือกไอคอนที่จะแสดงตามประเภท
    const Icon = type === 'success' ? IoCheckmarkCircleOutline : type === 'error' ? MdErrorOutline : TbFaceIdError;

    const iconColor = type === 'success' ? 'stroke-emerald-500' : type === 'error' ? 'fill-red-500 ' : 'stroke-yellow-500';
    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-opacity-50 bg-black">

            <div className={`w-72 bg-white p-6 rounded-lg shadow-lg max-w-xs text-center relative`}>
                <div className="absolute top-2 right-2 cursor-pointer" onClick={onClose}>
                    <CgClose size={24} />
                </div>

                {/* แสดงไอคอนตามประเภท */}
                <div className="mb-4">
                    <Icon size={40} className={`mx-auto  ${iconColor}`} />
                </div>

                <h4 className="text-2xl mb-5 font-semibold">{type}</h4>
                <h4 className="font-semibold">{message}</h4>
            </div>
        </div>
    );
}

export default AlertPopup;

import { useEffect, useState } from 'react'
function Navbar() {
    const [currentDateTime, setCurrentDateTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => { setCurrentDateTime(new Date()) }, 1000)

        return () => clearInterval(interval);
    }, [])

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }

    return (
        <>
            <div className=" border-b bg-slate-50 p-2">
                <div className="flex mx-10">
                    <div className="">
                        <p className="text-gray-700">
                            {currentDateTime.toLocaleDateString('th-TH', dateOptions)}
                        </p>
                        <p className="text-indigo-600 text-xl mt-2 font-bold">
                            {currentDateTime.toLocaleTimeString('th-TH', timeOptions)}
                        </p>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar
import React, { useState } from 'react';
import Pay from '../components/Pay';
import Request from './Request';
import RequestForm from '../components/RequestForm';



const Payements = () => {
    const [active, setActive] = useState("pay");

    const toggleHandler = (paymentType) => {
        setActive(paymentType);
    }

    return (
        <div className='flex flex-col bg-black w-full text-white border-t h-screen'>
            <div className='w-full flex px-8 py-4 gap-10 text-xl'>
                <div 
                    onClick={() => toggleHandler("pay")} 
                    className={`w-full flex justify-center border p-4 rounded-full ${active === "pay" ? 'bg-fadeBlue text-black' : 'bg-boxbg'} hover:bg-fadeBlue hover:text-black cursor-pointer`}
                >
                    Pay
                </div>
                <div 
                    onClick={() => toggleHandler("send-request")} 
                    className={`w-full flex justify-center border p-4 rounded-full ${active === "send-request" ? 'bg-fadeBlue text-black' : 'bg-boxbg'} hover:bg-fadeBlue hover:text-black cursor-pointer`}
                >
                    Request Money
                </div>
                <div 
                    onClick={() => toggleHandler("reqpay")} 
                    className={`w-full flex justify-center border p-4 rounded-full ${active === "reqpay" ? 'bg-fadeBlue text-black' : 'bg-boxbg'} hover:bg-fadeBlue hover:text-black cursor-pointer`}
                >
                    Inbox (Reqpay)
                </div>
            </div>
            <div className='h-full flex justify-center'>
                {active === "pay" && <Pay />}
                {active === "send-request" && <RequestForm />}
                {active === "reqpay" && <Request />}
            </div>
        </div>
    )
}

export default Payements;

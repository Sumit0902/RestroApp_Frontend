import React, { useRef } from "react";
import jsPDF from "jspdf";

const PrintSlip = () => {
    const slipRef = useRef();

    const handlePrint = () => {
        const doc = new jsPDF();
        doc.html(slipRef.current, {
            callback: (doc) => {
                doc.save("salary-slip.pdf");
            },
            x: 10,
            y: 10,
        });
    };

    return (
        <div>
            <div ref={slipRef} className="p-4 bg-white shadow-md w-1/2 mx-auto">
                <h1 className="text-xl font-bold mb-4">Salary Slip</h1>
                <p>Employee Name: John Doe</p>
                <p>Basic Salary: $5000</p>
                <p>HRA: $2000</p>
                <p>Net Pay: $7000</p>
            </div>
            <div className="text-center mt-4">
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Print Salary Slip
                </button>
            </div>
        </div>
    );
};

export default PrintSlip;

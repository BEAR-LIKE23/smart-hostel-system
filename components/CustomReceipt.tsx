import React, { useState } from 'react';
import { PaymentRecord, Student } from '../types';

interface CustomReceiptProps {
  payment: PaymentRecord | null;
  student: Student | null | undefined;
  onClose?: () => void;
}

export const CustomReceipt: React.FC<CustomReceiptProps> = ({ payment, student, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Fallback defaults
  const receiptNo = payment?.receipt_number || `HH-REC-${new Date().getFullYear()}-7829`;
  const studentName = payment?.student_name || student?.name || 'Resident Student';
  const studentEmail = student?.email || 'student@university.edu';
  const roomNumber = payment?.room_number || student?.rooms?.room_number || '101';
  const academicSession = payment?.academic_year || '2025/2026';
  const semester = payment?.semester || 'Full Session';
  const paymentDate = payment?.payment_date || new Date().toISOString().split('T')[0];
  const isPaid = payment?.status === 'Paid';
  const totalAmount = payment?.amount || 1200;

  // Breakdown calculations
  const roomFee = Math.round(totalAmount * 0.70);
  const utilityFee = Math.round(totalAmount * 0.15);
  const maintenanceFee = Math.round(totalAmount * 0.10);
  const cautionFee = totalAmount - (roomFee + utilityFee + maintenanceFee);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `HostelHub Receipt\nReceipt No: ${receiptNo}\nStudent: ${studentName}\nRoom: ${roomNumber}\nSession: ${academicSession} (${semester})\nAmount: $${totalAmount}.00 USD\nStatus: ${payment?.status || 'Paid'}\nDate: ${paymentDate}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-sans text-gray-800 dark:text-gray-100">
      {/* Top Action Toolbar */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Verified Electronic Payment Document
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            title="Copy Receipt Info"
          >
            {isCopied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Main Certificate / Voucher Body */}
      <div 
        id="official-receipt-card"
        className="relative bg-white dark:bg-gray-900 border-2 border-indigo-100 dark:border-indigo-950/60 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-left transition-all"
      >
        {/* Subtle Decorative Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        {/* Security Watermark Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none flex items-center justify-center select-none overflow-hidden">
          <span className="text-[120px] font-black tracking-widest text-indigo-950 dark:text-white rotate-[-30deg]">
            HOSTELHUB
          </span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-dashed border-gray-200 dark:border-gray-800 relative z-10 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20 border-2 border-white dark:border-gray-800">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">HOSTELHUB</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Official</span>
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Student Accommodation & Bursary Services</p>
              <p className="text-[10px] text-gray-400 font-mono">Central Campus Residential Authority</p>
            </div>
          </div>

          {/* Official Verification Stamp */}
          <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
            <div className={`px-3.5 py-1 rounded-xl border-2 font-black text-xs uppercase tracking-wider shadow-sm transform sm:-rotate-3 inline-block ${
              isPaid
                ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
            }`}>
              {isPaid ? '✓ PAID & VERIFIED' : '⏳ PAYMENT PENDING'}
            </div>
            <span className="font-mono text-[11px] font-extrabold text-gray-400 dark:text-gray-500 mt-1 block">
              {receiptNo}
            </span>
          </div>
        </div>

        {/* Student & Allocation Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-gray-100 dark:border-gray-800 text-xs">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Resident Name</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">{studentName}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Allocated Room</span>
            <p className="font-black text-indigo-600 dark:text-indigo-400 mt-0.5">Room {roomNumber}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Academic Session</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{academicSession}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Issue Date</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{paymentDate}</p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="py-4">
          <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5">Itemized Hostel Fees Breakdown</h4>
          <div className="rounded-2xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium">1. Standard Bed Space Accommodation ({semester})</span>
              <span className="font-bold font-mono text-gray-900 dark:text-gray-100">${roomFee}.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium">2. High-Speed Internet, Power & Water Utility</span>
              <span className="font-bold font-mono text-gray-900 dark:text-gray-100">${utilityFee}.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium">3. Hall Maintenance & Facility Sanitation Levy</span>
              <span className="font-bold font-mono text-gray-900 dark:text-gray-100">${maintenanceFee}.00</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium">4. Room Damage Caution Security (Refundable)</span>
              <span className="font-bold font-mono text-gray-900 dark:text-gray-100">${cautionFee}.00</span>
            </div>

            {/* Total Highlight */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <span className="text-sm font-black text-gray-900 dark:text-white block">TOTAL PAID</span>
                <span className="text-[10px] text-gray-400">Currency: USD ($) • Non-transferable</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  ${totalAmount}.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security QR & Signature Block */}
        <div className="pt-4 mt-2 border-t border-dashed border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* QR Verification Badge */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
              {/* SVG QR Placeholder */}
              <svg className="w-12 h-12 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h4v4h-4v-4zm-4-4h2v2h-2v-2zm4 0h4v2h-4v-2zm-4 4h2v4h-2v-4zm2-2h2v2h-2v-2z" />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-[9px] font-extrabold uppercase text-gray-400 block tracking-wider">Gate Security Token</span>
              <span className="font-mono text-xs font-extrabold text-gray-700 dark:text-gray-300">AUTH-{receiptNo.slice(-6)}</span>
              <p className="text-[8px] text-gray-400">Scan at entrance for residence verification</p>
            </div>
          </div>

          {/* Signature */}
          <div className="text-center sm:text-right">
            <div className="font-serif italic text-base text-indigo-700 dark:text-indigo-300 select-none">
              Prof. Alistair Sterling
            </div>
            <div className="w-32 border-t border-gray-400 dark:border-gray-600 mt-0.5 ml-auto"></div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">Hall Warden & Bursar</span>
          </div>
        </div>

        {/* Tear-off perforation styling */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-receipt-card, #official-receipt-card * {
            visibility: visible;
          }
          #official-receipt-card {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomReceipt;

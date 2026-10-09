import React from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";

export function BillToBlock() {
  const { clientName, clientAddress } = useInvoiceStore();

  return (
    <div className="border-l-4 border-blue-500 pl-4 min-w-0">
      <div className="text-sm font-bold text-blue-500 mb-1 uppercase tracking-wider">Bill To:</div>
      <div className="text-lg font-bold text-gray-900 break-words">{clientName}</div>
      <div className="text-sm text-gray-600 whitespace-pre-line break-words mt-1">
        {clientAddress}
      </div>
    </div>
  );
}

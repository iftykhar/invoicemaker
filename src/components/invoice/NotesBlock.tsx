import React from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";

export function NotesBlock() {
  const { notes } = useInvoiceStore();

  return (
    <div className="pt-6 border-t-2 border-dashed border-gray-200 min-w-0">
      <div className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Notes:</div>
      <div className="text-sm text-gray-600 whitespace-pre-line break-words bg-yellow-50 p-4 rounded border border-yellow-100">
        {notes}
      </div>
    </div>
  );
}

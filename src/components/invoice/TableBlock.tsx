import React from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { formatCurrency } from "@/lib/formatCurrency";

export function TableBlock() {
  const { items, currency, headerDesc, headerQty, headerPrice, headerTotal } = useInvoiceStore();

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-y-2 border-gray-200">
            <th className="py-4 px-3 font-semibold">{headerDesc}</th>
            <th className="py-4 px-3 w-16 text-center font-semibold">{headerQty}</th>
            <th className="py-4 px-3 w-28 text-right font-semibold">{headerPrice} ({currency})</th>
            <th className="py-4 px-3 w-36 text-right font-semibold">{headerTotal} ({currency})</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="text-sm border-b border-gray-100 last:border-b-2 last:border-gray-200">
              <td className="py-3 px-3 break-words max-w-[200px] font-medium text-gray-800">{it.description}</td>
              <td className="py-3 px-3 text-center text-gray-600">{it.qty}</td>
              <td className="py-3 px-3 text-right text-gray-600">
                {currency} {formatCurrency(it.price)}
              </td>
              <td className="py-3 px-3 text-right font-bold text-gray-900">
                {currency} {formatCurrency(it.qty * it.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

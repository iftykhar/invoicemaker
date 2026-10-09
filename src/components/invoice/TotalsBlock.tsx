import React, { useMemo } from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { formatCurrency } from "@/lib/formatCurrency";

export function TotalsBlock() {
  const { items, currency } = useInvoiceStore();

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + (it.qty || 0) * (it.price || 0),
      0
    );
  }, [items]);

  return (
    <div className="flex justify-end">
      <div className="w-72 bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between py-2 text-sm text-gray-600">
          <div>Subtotal</div>
          <div className="font-semibold text-gray-900">
            {formatCurrency(subtotal)} {currency}
          </div>
        </div>
        <div className="flex justify-between py-2 mt-2 pt-2 border-t-2 border-gray-200">
          <div className="font-bold text-lg text-gray-900">GRAND TOTAL</div>
          <div className="font-black text-xl text-blue-600">
            {formatCurrency(subtotal)} {currency}
          </div>
        </div>
      </div>
    </div>
  );
}

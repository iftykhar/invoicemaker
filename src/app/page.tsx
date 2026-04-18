"use client";

import React, { useRef, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Removed static imports of html2canvas and jspdf for performance
import { JSX } from "react/jsx-dev-runtime";

interface Item {
  id: number;
  description: string;
  qty: number;
  price: number;
}

// Helper to safely parse and limit to 2 decimal places for currency display
const formatCurrency = (value: number | string): string => {
  const num = Number(value) || 0;
  // Use a simple, non-locale-specific string format to avoid more parsing issues
  return num.toFixed(2); 
};

export default function InvoiceMakerPage(): JSX.Element {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const CURRENCY_SYMBOL = "BDT"; 

  const [companyName, setCompanyName] = useState("Acme Co.");
  const [companyAddress, setCompanyAddress] = useState(
    "123 Business Road, Dhaka, Bangladesh"
  );
  const [clientName, setClientName] = useState("Client Name");
  const [clientAddress, setClientAddress] = useState("Client Address");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("Thank you for your business.");
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<Item[]>([
    { id: 1, description: "Web design", qty: 1, price: 15000 },
    { id: 2, description: "Hosting (1 year)", qty: 1, price: 3000 },
  ]);

  function addItem() {
    setItems((s) => [
      ...s,
      { id: Date.now(), description: "New item", qty: 1, price: 0 },
    ]);
  }

  function updateItem(id: number, patch: Partial<Item>) {
    setItems((s) =>
      s.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function removeItem(id: number) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + (it.qty || 0) * (it.price || 0),
      0
    );
  }, [items]);

  const handleExportPDF = async () => {
    const input = previewRef.current;
    if (!input) return;

    setLoading(true);

    // Explicitly set safe, simple colors just before capture
    input.style.backgroundColor = "#ffffff";
    input.style.color = "#111827";

    try {
      // Dynamic imports to reduce TBT (Total Blocking Time)
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(input, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2, // Reduced scale slightly for better performance on mobile
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95); // Slightly lower quality for smaller file size
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasAspectRatio = canvas.height / canvas.width;
      const pdfHeight = pdfWidth * canvasAspectRatio;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoice Maker</h1>
        <div className="flex gap-2">
          <Button onClick={addItem} variant="secondary" className="bg-blue-500 hover:bg-gray-600 text-white cursor-pointer">
            + Add Item
          </Button>
          <Button onClick={handleExportPDF} className="bg-red-500 text-white font-bold hover:bg-red-700 cursor-pointer" disabled={loading}>
            {loading ? "Exporting..." : "Convert to PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel - Inputs (No changes needed here) */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Company Info */}
              <div>
                <label className="block text-sm">Company name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm">Company address</label>
                <Textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>
              {/* Client Info */}
              <div>
                <label className="block text-sm">Client name</label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm">Client address</label>
                <Textarea
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
              {/* Invoice Numbers/Date */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm">Invoice #</label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm">Date</label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className="block text-sm">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right panel - Preview & Item Controls */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 1. Invoice Preview Area - THE FIX IS APPLIED HERE */}
              <div
                ref={previewRef}
                id="invoice-preview"
                style={{ backgroundColor: "#ffffff", color: "#111827" }}
                className="p-6 rounded shadow-sm border border-[#ccc]" // <--- Simplified border color
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold break-words">{companyName}</h2>
                    <div className="text-sm whitespace-pre-line break-words">
                      {companyAddress}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#444]">INVOICE</div>
                    <div className="text-sm">No: {invoiceNumber}</div>
                    <div className="text-sm">
                      Date: {new Date(invoiceDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mb-6 border-l-4 border-[#3b82f6] pl-3 min-w-0"> {/* Added min-w-0 */}
                  <div className="text-sm font-semibold text-[#3b82f6] mb-1">Bill To:</div>
                  <div className="font-medium break-words">{clientName}</div>
                  <div className="text-sm whitespace-pre-line break-words">
                    {clientAddress}
                  </div>
                </div>

                {/* Item Table - THE FIX IS APPLIED HERE */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left bg-[#f3f4f6] text-xs uppercase tracking-wider text-[#4b5563]">
                        <th className="border-b-2 border-[#ccc] py-3 px-2">Description</th> {/* <--- Simplified border color */}
                        <th className="border-b-2 border-[#ccc] py-3 px-2 w-16 text-center">Qty</th> {/* <--- Simplified border color */}
                        <th className="border-b-2 border-[#ccc] py-3 px-2 w-24 text-right">Price ({CURRENCY_SYMBOL})</th> {/* <--- Simplified border color */}
                        <th className="border-b-2 border-[#ccc] py-3 px-2 w-32 text-right">Total ({CURRENCY_SYMBOL})</th> {/* <--- Simplified border color */}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.id} className="text-sm border-b border-[#eee] last:border-b-0">
                          <td className="py-2 px-2 break-words max-w-[200px]">{it.description}</td>
                          <td className="py-2 px-2 text-center">{it.qty}</td>
                          <td className="py-2 px-2 text-right">
                            {formatCurrency(it.price)}
                          </td>
                          <td className="py-2 px-2 text-right font-medium">
                            {formatCurrency(it.qty * it.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals - THE FIX IS APPLIED HERE */}
                <div className="flex justify-end">
                  <div className="w-64 border-t border-[#ccc] pt-2"> {/* <--- Simplified border color */}
                    <div className="flex justify-between py-1 text-sm">
                      <div>Subtotal</div>
                      <div className="font-medium">
                        {formatCurrency(subtotal)} {CURRENCY_SYMBOL}
                      </div>
                    </div>
                    <div className="flex justify-between py-1 border-t border-[#ccc] mt-2 pt-2"> {/* <--- Simplified border color */}
                      <div className="font-bold text-base">GRAND TOTAL</div>
                      <div className="font-extrabold text-xl text-[#3b82f6]">
                        {formatCurrency(subtotal)} {CURRENCY_SYMBOL}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes/Footer - THE FIX IS APPLIED HERE */}
                <div className="mt-8 pt-4 border-t border-dashed border-[#ccc] min-w-0">
                  <div className="font-semibold text-[#444] mb-1">Notes:</div>
                  <div className="text-sm text-[#6b7280] italic whitespace-pre-line break-words">
                    {notes}
                  </div>
                </div>
              </div>

              {/* 2. Inline editable items controls (No changes needed here) */}
              <div className="mt-6 p-4 border rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Edit Items</h3>
                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={it.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-3 border rounded bg-white shadow-xs">
                      <div className="flex-1 w-full min-w-0">
                        <Input
                          placeholder="Description"
                          value={it.description}
                          onChange={(e) =>
                            updateItem(it.id, { description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={it.qty.toString()}
                          className="w-full sm:w-20"
                          onChange={(e) =>
                            updateItem(it.id, { qty: Number(e.target.value) || 0 })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={it.price.toString()}
                          className="w-full sm:w-28"
                          onChange={(e) =>
                            updateItem(it.id, {
                              price: Number(e.target.value) || 0,
                            })
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="shrink-0"
                          onClick={() => removeItem(it.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        Tip: Edit the invoice fields and press{" "}
        <span className="font-medium">Convert to PDF</span> to save the preview
        as a PDF.
      </div>
    </div>
  );
}
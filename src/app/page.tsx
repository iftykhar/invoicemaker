"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReactToPrint } from "react-to-print";
import { JSX } from "react/jsx-dev-runtime";

import { useInvoiceStore } from "@/store/useInvoiceStore";
import { HeaderBlock } from "@/components/invoice/HeaderBlock";
import { BillToBlock } from "@/components/invoice/BillToBlock";
import { TableBlock } from "@/components/invoice/TableBlock";
import { TotalsBlock } from "@/components/invoice/TotalsBlock";
import { NotesBlock } from "@/components/invoice/NotesBlock";

import { LayoutAShell } from "@/components/invoice/layouts/LayoutAShell";
import { LayoutBShell } from "@/components/invoice/layouts/LayoutBShell";
import { LayoutCShell } from "@/components/invoice/layouts/LayoutCShell";

export default function InvoiceMakerPage(): JSX.Element {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [loading] = useState(false);
  
  const {
    activeLayout, setActiveLayout,
    currency, setCurrency,
    headerDesc, headerQty, headerPrice, headerTotal, setHeaders,
    companyName, companyAddress,
    clientName, clientAddress,
    invoiceNumber, invoiceDate,
    notes,
    updateField,
    items, addItem, updateItem, removeItem,
  } = useInvoiceStore();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => updateField('logoUrl', event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExportPDF = useReactToPrint({
    contentRef: previewRef,
    documentTitle: invoiceNumber,
    pageStyle: `
      @page {
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  const renderBlock = (id: string) => {
    switch (id) {
      case 'header': return <HeaderBlock />;
      case 'billTo': return <BillToBlock />;
      case 'table': return <TableBlock />;
      case 'totals': return <TotalsBlock />;
      case 'notes': return <NotesBlock />;
      default: return null;
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#0f172a] text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-white border-4 border-black rounded-none shadow-[8px_8px_0_0_#000]">
          <h1 className="text-xl sm:text-2xl font-pixel uppercase tracking-widest text-gray-700">Invoice Maker</h1>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0 items-center">
            
            {/* Layout Toggle UI */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-sm border-2 border-gray-300">
              <button 
                className={`px-3 py-1 text-[10px] sm:text-xs font-pixel uppercase ${activeLayout === 'A' ? 'bg-white shadow-[2px_2px_0_0_#000] border-2 border-black' : 'text-gray-500 hover:text-gray-900 border-2 border-transparent'}`} 
                onClick={() => setActiveLayout('A')}
              >
                Classic
              </button>
              <button 
                className={`px-3 py-1 text-[10px] sm:text-xs font-pixel uppercase ${activeLayout === 'B' ? 'bg-white shadow-[2px_2px_0_0_#000] border-2 border-black' : 'text-gray-500 hover:text-gray-900 border-2 border-transparent'}`} 
                onClick={() => setActiveLayout('B')}
              >
                Grid
              </button>
              <button 
                className={`px-3 py-1 text-[10px] sm:text-xs font-pixel uppercase ${activeLayout === 'C' ? 'bg-white shadow-[2px_2px_0_0_#000] border-2 border-black' : 'text-gray-500 hover:text-gray-900 border-2 border-transparent'}`} 
                onClick={() => setActiveLayout('C')}
              >
                Builder
              </button>
            </div>

            <Button onClick={addItem} variant="secondary">
              + Add Item
            </Button>
            <Button onClick={handleExportPDF} disabled={loading}>
              {loading ? "Exporting..." : "Download Invoice"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left panel - Inputs */}
          <div className="col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Company Logo (Optional)</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer file:cursor-pointer"
                    />
                  </div>
                  {/* Company Info */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Company name</label>
                    <Input
                      value={companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Company address</label>
                    <Textarea
                      value={companyAddress}
                      onChange={(e) => updateField('companyAddress', e.target.value)}
                    />
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                  {/* Client Info */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Client name</label>
                    <Input
                      value={clientName}
                      onChange={(e) => updateField('clientName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Client address</label>
                    <Textarea
                      value={clientAddress}
                      onChange={(e) => updateField('clientAddress', e.target.value)}
                    />
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                  {/* Invoice Numbers/Date */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Invoice #</label>
                      <Input
                         value={invoiceNumber}
                        onChange={(e) => updateField('invoiceNumber', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Date</label>
                      <Input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => updateField('invoiceDate', e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Notes */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2 mt-4">Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Table Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Currency Symbol</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="flex h-9 w-full min-w-0 bg-white border-4 border-black rounded-none px-3 py-1 text-[10px] font-pixel sm:text-xs shadow-[4px_4px_0_0_#000] focus-visible:bg-[#fef08a] focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-[2px_2px_0_0_#000] outline-none cursor-pointer transition-none"
                    >
                      <option value="৳">Taka (৳)</option>
                      <option value="$">Dollar ($)</option>
                      <option value="€">Euro (€)</option>
                      <option value="£">Pound (£)</option>
                      <option value="₹">Rupee (₹)</option>
                      <option value="¥">Yen (¥)</option>
                      <option value="BDT">BDT</option>
                      <option value="USD">USD</option>
                      <option value="">(None)</option>
                    </select>
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Column 1</label>
                      <Input value={headerDesc} onChange={(e) => setHeaders({ headerDesc: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Column 2</label>
                      <Input value={headerQty} onChange={(e) => setHeaders({ headerQty: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Column 3</label>
                      <Input value={headerPrice} onChange={(e) => setHeaders({ headerPrice: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Column 4</label>
                      <Input value={headerTotal} onChange={(e) => setHeaders({ headerTotal: e.target.value })} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editable items controls */}
            <Card>
               <CardHeader>
                <CardTitle>Edit Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((it) => (
                    <div key={it.id} className="flex flex-col gap-3 p-4 bg-white border-4 border-black rounded-none shadow-[4px_4px_0_0_#000]">
                      <Input
                        placeholder="Description"
                        value={it.description}
                        onChange={(e) =>
                          updateItem(it.id, { description: e.target.value })
                        }
                      />
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={it.qty.toString()}
                          className="w-20"
                          onChange={(e) =>
                            updateItem(it.id, { qty: Number(e.target.value) || 0 })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={it.price.toString()}
                          className="flex-1"
                          onChange={(e) =>
                            updateItem(it.id, {
                              price: Number(e.target.value) || 0,
                            })
                          }
                        />
                        <Button
                          variant="destructive"
                          onClick={() => removeItem(it.id)}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right panel - Preview */}
          <div className="col-span-1 xl:col-span-2">
            <div className="sticky top-6">
                <div
                  ref={previewRef}
                  id="invoice-preview"
                  style={{ backgroundColor: "#ffffff", color: "#111827" }}
                  className="p-8 md:p-12 border border-gray-200 shadow-xl font-sans bg-white relative print:shadow-none print:border-none print:w-full print:max-w-[210mm] print:mx-auto"
                >
                  {activeLayout === 'A' && <LayoutAShell renderBlock={renderBlock} />}
                  {activeLayout === 'B' && <LayoutBShell renderBlock={renderBlock} />}
                  {activeLayout === 'C' && <LayoutCShell renderBlock={renderBlock} />}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
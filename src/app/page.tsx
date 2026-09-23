"use client";

import React, { useRef, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragStartEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useReactToPrint } from "react-to-print";
import { JSX } from "react/jsx-dev-runtime";

interface Item {
  id: number;
  description: string;
  qty: number;
  price: number;
}

const formatCurrency = (value: number | string): string => {
  const num = Number(value) || 0;
  return num.toFixed(2); 
};

function DroppableZone({ id, children, isActive }: { id: string, children?: React.ReactNode, isActive: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const isOutlineVisible = isActive && !children;
  
  return (
    <div 
      ref={setNodeRef} 
      className={`transition-all flex items-center justify-center ${!children ? 'empty-drop-zone min-w-[10px] min-h-[10px]' : ''} ${isOver ? 'bg-blue-100 outline-dashed outline-2 outline-blue-400 p-2 rounded' : ''} ${isOutlineVisible ? 'outline-dotted outline-2 outline-gray-200 p-2 rounded' : ''}`}
    >
      {children}
    </div>
  );
}

function DraggableLogo({ src }: { src: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'logo' });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 } : undefined;
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Logo" className="max-h-16 max-w-32 object-contain" />
    </div>
  );
}

function SortableBlock({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`group relative ${isDragging ? 'opacity-50' : ''} mb-8 last:mb-0`}>
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 print:hidden p-2 text-xl"
        title="Drag to reorder"
      >
        &#8942;&#8942;
      </div>
      {children}
    </div>
  );
}

export default function InvoiceMakerPage(): JSX.Element {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [currency, setCurrency] = useState("৳");
  const [headerDesc, setHeaderDesc] = useState("Description");
  const [headerQty, setHeaderQty] = useState("Qty");
  const [headerPrice, setHeaderPrice] = useState("Price");
  const [headerTotal, setHeaderTotal] = useState("Total");

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
  const [loading] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  const [items, setItems] = useState<Item[]>([
    { id: 1, description: "Web design", qty: 1, price: 15000 },
    { id: 2, description: "Hosting (1 year)", qty: 1, price: 3000 },
  ]);

  const [layoutOrder, setLayoutOrder] = useState(['header', 'billTo', 'table', 'totals', 'notes']);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.id === 'logo') {
      setIsDraggingLogo(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingLogo(false);
    const { active, over } = event;
    if (!over) return;

    if (active.id === 'logo') {
      if (['left', 'right', 'top', 'bottom'].includes(over.id as string)) {
        setLogoPosition(over.id as 'left' | 'right' | 'top' | 'bottom');
      }
    } else {
      if (active.id !== over.id) {
        setLayoutOrder((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
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
      case 'header':
        return (
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <DroppableZone id="top" isActive={isDraggingLogo}>
                {logoUrl && logoPosition === 'top' && <DraggableLogo src={logoUrl} />}
              </DroppableZone>
              
              <div className="flex items-center gap-4">
                <DroppableZone id="left" isActive={isDraggingLogo}>
                  {logoUrl && logoPosition === 'left' && <DraggableLogo src={logoUrl} />}
                </DroppableZone>
                
                <div>
                  <h2 className="text-2xl font-bold break-words text-gray-900">{companyName}</h2>
                  <div className="text-sm whitespace-pre-line break-words text-gray-600 mt-1">
                    {companyAddress}
                  </div>
                </div>

                <DroppableZone id="right" isActive={isDraggingLogo}>
                  {logoUrl && logoPosition === 'right' && <DraggableLogo src={logoUrl} />}
                </DroppableZone>
              </div>

              <DroppableZone id="bottom" isActive={isDraggingLogo}>
                {logoUrl && logoPosition === 'bottom' && <DraggableLogo src={logoUrl} />}
              </DroppableZone>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-black text-gray-200 tracking-tighter">INVOICE</div>
              <div className="text-sm font-semibold mt-2 text-gray-800">No: {invoiceNumber}</div>
              <div className="text-sm text-gray-600">
                Date: {new Date(invoiceDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      case 'billTo':
        return (
          <div className="border-l-4 border-blue-500 pl-4 min-w-0">
            <div className="text-sm font-bold text-blue-500 mb-1 uppercase tracking-wider">Bill To:</div>
            <div className="text-lg font-bold text-gray-900 break-words">{clientName}</div>
            <div className="text-sm text-gray-600 whitespace-pre-line break-words mt-1">
              {clientAddress}
            </div>
          </div>
        );
      case 'table':
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
      case 'totals':
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
      case 'notes':
        return (
          <div className="pt-6 border-t-2 border-dashed border-gray-200 min-w-0">
            <div className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Notes:</div>
            <div className="text-sm text-gray-600 whitespace-pre-line break-words bg-yellow-50 p-4 rounded border border-yellow-100">
              {notes}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#0f172a] text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-white border-4 border-black rounded-none shadow-[8px_8px_0_0_#000]">
          <h1 className="text-xl sm:text-2xl font-pixel uppercase tracking-widest text-gray-700">Invoice Maker</h1>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Button onClick={addItem} variant="secondary">
              + Add Item
            </Button>
            <Button onClick={handleExportPDF} disabled={loading}>
              {loading ? "Exporting..." : "Download Invoice"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Company address</label>
                    <Textarea
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                  {/* Client Info */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Client name</label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2">Client address</label>
                    <Textarea
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                    />
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                  {/* Invoice Numbers/Date */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Invoice #</label>
                      <Input
                         value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Date</label>
                      <Input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Notes */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-pixel mb-2 mt-4">Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
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
                      <Input value={headerDesc} onChange={(e) => setHeaderDesc(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Column 2</label>
                      <Input value={headerQty} onChange={(e) => setHeaderQty(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Column 3</label>
                      <Input value={headerPrice} onChange={(e) => setHeaderPrice(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-pixel mb-2">Column 4</label>
                      <Input value={headerTotal} onChange={(e) => setHeaderTotal(e.target.value)} />
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
          <div className="col-span-1 lg:col-span-2">
            <div className="sticky top-6">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div
                  ref={previewRef}
                  id="invoice-preview"
                  style={{ backgroundColor: "#ffffff", color: "#111827" }}
                  className="p-8 md:p-12 border border-gray-200 shadow-xl font-sans bg-white relative print:shadow-none print:border-none print:w-full print:max-w-[210mm] print:mx-auto"
                >
                  <SortableContext items={layoutOrder} strategy={verticalListSortingStrategy}>
                    {layoutOrder.map((id) => (
                      <SortableBlock key={id} id={id}>
                        {renderBlock(id)}
                      </SortableBlock>
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
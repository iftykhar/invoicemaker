"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Item {
  id: number;
  description: string;
  qty: number;
  price: number;
}

export default function InvoiceMakerPage(): JSX.Element {
  const previewRef = useRef<HTMLDivElement | null>(null);

  const [companyName, setCompanyName] = useState("Acme Co.");
  const [companyAddress, setCompanyAddress] = useState(
    "123 Business Road, Dhaka, Bangladesh"
  );
  const [clientName, setClientName] = useState("Client Name");
  const [clientAddress, setClientAddress] = useState("Client Address");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
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
    setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: number) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  function subtotal() {
    return items.reduce(
      (sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0),
      0
    );
  }

  const handleExportPDF = async () => {
    const input = previewRef.current;
    if (!input) return;

    setLoading(true);

    // ✅ Safe color fallback for Tailwind lab() issue
    input.style.backgroundColor = "#ffffff";
    input.style.color = "#111827";

    try {
      const canvas = await html2canvas(input, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoice Maker</h1>
        <div className="flex gap-2">
          <Button onClick={addItem}>Add Item</Button>
          <Button onClick={handleExportPDF} disabled={loading}>
            {loading ? "Exporting..." : "Convert to PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                    defaultValue={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>
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

        {/* Right panel - preview */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={previewRef}
                id="invoice-preview"
                style={{ backgroundColor: "#ffffff", color: "#111827" }}
                className="p-6 rounded shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{companyName}</h2>
                    <div className="text-sm whitespace-pre-line">
                      {companyAddress}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Invoice</div>
                    <div className="font-semibold">{invoiceNumber}</div>
                    <div className="text-sm">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-600">Bill To:</div>
                  <div className="font-medium">{clientName}</div>
                  <div className="text-sm whitespace-pre-line">
                    {clientAddress}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left">
                        <th className="border-b pb-2">Description</th>
                        <th className="border-b pb-2">Qty</th>
                        <th className="border-b pb-2">Price</th>
                        <th className="border-b pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2">{it.description}</td>
                          <td className="py-2">{it.qty}</td>
                          <td className="py-2">
                            {Number(it.price).toLocaleString()}
                          </td>
                          <td className="py-2">
                            {(it.qty * it.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <div>Subtotal</div>
                      <div className="font-medium">
                        {subtotal().toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between py-1 border-t">
                      <div className="font-semibold">Total</div>
                      <div className="font-bold text-lg">
                        {subtotal().toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-600">{notes}</div>
              </div>

              {/* Inline editable items controls */}
              <div className="mt-4 space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-2 items-center">
                    <Input
                      className="flex-1"
                      value={it.description}
                      onChange={(e) =>
                        updateItem(it.id, { description: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      value={it.qty}
                      className="w-24"
                      onChange={(e) =>
                        updateItem(it.id, { qty: Number(e.target.value) })
                      }
                    />
                    <Input
                      type="number"
                      value={it.price}
                      className="w-32"
                      onChange={(e) =>
                        updateItem(it.id, { price: Number(e.target.value) })
                      }
                    />
                    <Button
                      variant="ghost"
                      onClick={() => removeItem(it.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
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




// "use client"

// import React, { useRef, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";


// export default function InvoiceMakerPage() {
//   const previewRef = useRef(null);

//   const [companyName, setCompanyName] = useState("Acme Co.");
//   const [companyAddress, setCompanyAddress] = useState("123 Business Road, Dhaka, Bangladesh");
//   const [clientName, setClientName] = useState("Client Name");
//   const [clientAddress, setClientAddress] = useState("Client Address");
//   const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
//   const [notes, setNotes] = useState("Thank you for your business.");


//   const [items, setItems] = useState<Item[]>([
//   { id: 1, description: "Web design", qty: 1, price: 15000 },
//   { id: 2, description: "Hosting (1 year)", qty: 1, price: 3000 },
// ]);

//   const [loading, setLoading] = useState(false);

//   function addItem() {
//     setItems((s) => [...s, { id: Date.now(), description: "New item", qty: 1, price: 0 }]);
//   }

//   interface Item {
//     id: number;
//     description: string;
//     qty: number;
//     price: number;
//   }

//   interface ItemPatch {
//     description?: string;
//     qty?: number;
//     price?: number;
//   }

//   function updateItem(id: number, patch: ItemPatch) {
//     setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));
//   }
  
//   function removeItem(id: number) {
//   setItems((s) => s.filter((it) => it.id !== id));
// }


//   function subtotal() {
//     return items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);
//   }

// const handleExportPDF = async () => {
//   const input = document.getElementById("invoice-preview"); // ✅ FIXED
//   if (!input) return;

//   try {
//     const canvas = await html2canvas(input, {
//       useCORS: true,
//       backgroundColor: "#ffffff",
//     });

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//     pdf.save("invoice.pdf");
//   } catch (error) {
//     console.error("PDF generation failed:", error);
//   }
// };


//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold">Invoice Maker</h1>
//         <div className="flex gap-2">
//           <Button onClick={addItem}>Add Item</Button>
//           <Button onClick={handleExportPDF} disabled={loading}>
//             {loading ? "Exporting..." : "Convert to PDF"}
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Left: form controls */}
//         <Card className="col-span-1 md:col-span-1">
//           <CardHeader>
//             <CardTitle>Invoice Details</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-sm">Company name</label>
//                 <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
//               </div>
//               <div>
//                 <label className="block text-sm">Company address</label>
//                 <Textarea value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
//               </div>
//               <div>
//                 <label className="block text-sm">Client name</label>
//                 <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
//               </div>
//               <div>
//                 <label className="block text-sm">Client address</label>
//                 <Textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
//               </div>
//               <div className="flex gap-2">
//                 <div className="flex-1">
//                   <label className="block text-sm">Invoice #</label>
//                   <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
//                 </div>
//                 <div className="flex-1">
//                   <label className="block text-sm">Date</label>
//                   <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm">Notes</label>
//                 <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Right: preview */}
//         <div className="col-span-1 md:col-span-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Preview</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div
//                 ref={previewRef}
//                 id="invoice-preview"
//                 className="bg-white p-6 rounded shadow-sm" // white background is important for clear PDF
//                 style={{ color: "#111827" }}
//               >
//                 <div className="flex justify-between items-start mb-6">
//                   <div>
//                     <h2 className="text-xl font-bold">{companyName}</h2>
//                     <div className="text-sm whitespace-pre-line">{companyAddress}</div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm">Invoice</div>
//                     <div className="font-semibold">{invoiceNumber}</div>
//                     <div className="text-sm">{new Date().toLocaleDateString()}</div>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <div className="text-sm text-gray-600">Bill To:</div>
//                   <div className="font-medium">{clientName}</div>
//                   <div className="text-sm whitespace-pre-line">{clientAddress}</div>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto border-collapse">
//                     <thead>
//                       <tr className="text-left">
//                         <th className="border-b pb-2">Description</th>
//                         <th className="border-b pb-2">Qty</th>
//                         <th className="border-b pb-2">Price</th>
//                         <th className="border-b pb-2">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {items.map((it) => (
//                         <tr key={it.id} className="align-top">
//                           <td className="py-2">{it.description}</td>
//                           <td className="py-2">{it.qty}</td>
//                           <td className="py-2">{Number(it.price).toLocaleString()}</td>
//                           <td className="py-2">{(it.qty * it.price).toLocaleString()}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="flex justify-end mt-6">
//                   <div className="w-64">
//                     <div className="flex justify-between py-1">
//                       <div>Subtotal</div>
//                       <div className="font-medium">{subtotal().toLocaleString()}</div>
//                     </div>
//                     <div className="flex justify-between py-1 border-t">
//                       <div className="font-semibold">Total</div>
//                       <div className="font-bold text-lg">{subtotal().toLocaleString()}</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6 text-sm text-gray-600">{notes}</div>
//               </div>

//               {/* Inline editable items controls (keeps UI compact) */}
//               <div className="mt-4 space-y-2">
//                 {items.map((it) => (
//                   <div key={it.id} className="flex gap-2 items-center">
//                     <Input
//                       className="flex-1"
//                       value={it.description}
//                       onChange={(e) => updateItem(it.id, { description: e.target.value })}
//                     />
//                     <Input
//                       type="number"
//                       value={it.qty}
//                       className="w-24"
//                       onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })}
//                     />
//                     <Input
//                       type="number"
//                       value={it.price}
//                       className="w-32"
//                       onChange={(e) => updateItem(it.id, { price: Number(e.target.value) })}
//                     />
//                     <Button variant={"ghost"} onClick={() => removeItem(it.id)}>
//                       Remove
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       <div className="mt-6 text-sm text-muted-foreground">
//         Tip: Edit the invoice fields and press <span className="font-medium">Convert to PDF</span> to save the preview area
//         as a PDF.
//       </div>
//     </div>
//   );
// }

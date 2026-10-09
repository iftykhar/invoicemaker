import React from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { DroppableZone } from "./DroppableZone";
import { DraggableLogo } from "./DraggableLogo";

export function HeaderBlock() {
  const { companyName, companyAddress, invoiceNumber, invoiceDate, logoUrl, logoPosition, isDraggingLogo } = useInvoiceStore();

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
}

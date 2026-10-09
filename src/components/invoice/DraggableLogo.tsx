import React from "react";
import { useDraggable } from "@dnd-kit/core";

export function DraggableLogo({ src }: { src: string }) {
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

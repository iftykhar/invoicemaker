import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function DroppableZone({ id, children, isActive }: { id: string, children?: React.ReactNode, isActive: boolean }) {
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

import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from "@dnd-kit/core";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { CSS } from "@dnd-kit/utilities";

function DraggableBlock({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`group relative ${isDragging ? 'opacity-50' : ''} mb-4 last:mb-0`}>
       <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 print:hidden p-1 text-lg"
      >
        &#8942;&#8942;
      </div>
      {children}
    </div>
  );
}

function GridZone({ id, children, emptyLabel }: { id: string, children: React.ReactNode, emptyLabel: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const childCount = React.Children.count(children);
  
  return (
    <div ref={setNodeRef} className={`min-h-[100px] border-2 border-transparent ${isOver ? 'bg-blue-50 border-dashed border-blue-400' : ''} ${childCount === 0 ? 'border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-400 print:hidden' : ''} rounded-lg p-2 transition-colors`}>
      {childCount > 0 ? children : emptyLabel}
    </div>
  );
}

export function LayoutBShell({ renderBlock }: { renderBlock: (id: string) => React.ReactNode }) {
  const { layoutB_zones, setLayoutBZone, updateField, setIsDraggingLogo } = useInvoiceStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.id === 'logo') setIsDraggingLogo(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingLogo(false);
    const { active, over } = event;
    if (!over) return;
    
    if (active.id === 'logo') {
      if (['left', 'right', 'top', 'bottom'].includes(over.id as string)) {
        updateField('logoPosition', over.id as 'left' | 'right' | 'top' | 'bottom');
      }
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string; 
    
    let sourceZone: string | null = null;
    for (const [zone, items] of Object.entries(layoutB_zones)) {
      if (items.includes(activeId)) {
        sourceZone = zone;
        break;
      }
    }

    if (sourceZone && sourceZone !== overId && overId in layoutB_zones) {
      setLayoutBZone(sourceZone, layoutB_zones[sourceZone as keyof typeof layoutB_zones].filter(id => id !== activeId));
      setLayoutBZone(overId, [...layoutB_zones[overId as keyof typeof layoutB_zones], activeId]);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GridZone id="topLeft" emptyLabel="Top Left">
            {layoutB_zones.topLeft.map(id => <DraggableBlock key={id} id={id}>{renderBlock(id)}</DraggableBlock>)}
          </GridZone>
          <GridZone id="topRight" emptyLabel="Top Right">
            {layoutB_zones.topRight.map(id => <DraggableBlock key={id} id={id}>{renderBlock(id)}</DraggableBlock>)}
          </GridZone>
        </div>
        
        {/* Main Body */}
        <GridZone id="main" emptyLabel="Main Body">
          {layoutB_zones.main.map(id => <DraggableBlock key={id} id={id}>{renderBlock(id)}</DraggableBlock>)}
        </GridZone>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <GridZone id="bottomLeft" emptyLabel="Bottom Left">
            {layoutB_zones.bottomLeft.map(id => <DraggableBlock key={id} id={id}>{renderBlock(id)}</DraggableBlock>)}
          </GridZone>
          <GridZone id="bottomRight" emptyLabel="Bottom Right">
            {layoutB_zones.bottomRight.map(id => <DraggableBlock key={id} id={id}>{renderBlock(id)}</DraggableBlock>)}
          </GridZone>
        </div>
      </div>
    </DndContext>
  );
}

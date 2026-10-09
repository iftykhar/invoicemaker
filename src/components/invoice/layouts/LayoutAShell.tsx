import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useInvoiceStore } from "@/store/useInvoiceStore";

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

export function LayoutAShell({ renderBlock }: { renderBlock: (id: string) => React.ReactNode }) {
  const { layoutOrder, setLayoutOrder, updateField, setIsDraggingLogo } = useInvoiceStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        updateField('logoPosition', over.id as 'left' | 'right' | 'top' | 'bottom');
      }
      return;
    }

    if (active.id !== over.id) {
      setLayoutOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={layoutOrder} strategy={verticalListSortingStrategy}>
        {layoutOrder.map((id) => (
          <SortableBlock key={id} id={id}>
            {renderBlock(id)}
          </SortableBlock>
        ))}
      </SortableContext>
    </DndContext>
  );
}

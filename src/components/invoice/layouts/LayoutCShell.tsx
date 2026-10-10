import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useInvoiceStore } from "@/store/useInvoiceStore";

function SortableBlockC({ id, children, isPalette }: { id: string, children: React.ReactNode, isPalette?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`group relative ${isDragging ? 'opacity-50' : ''} ${isPalette ? 'mb-2 p-3 bg-white border border-gray-300 shadow-sm rounded cursor-grab active:cursor-grabbing hover:bg-gray-50 print:hidden' : 'mb-8 last:mb-0'}`}>
      {!isPalette && (
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 print:hidden p-2 text-xl"
        >
          &#8942;&#8942;
        </div>
      )}
      {isPalette ? (
        <div {...attributes} {...listeners} className="font-semibold text-sm capitalize text-gray-700">{id} Block</div>
      ) : (
        children
      )}
    </div>
  );
}

export function LayoutCShell({ renderBlock }: { renderBlock: (id: string) => React.ReactNode }) {
  const { layoutC_available, layoutC_active, setLayoutC, updateField, setIsDraggingLogo } = useInvoiceStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.id === 'logo') setIsDraggingLogo(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === 'logo' || ['left', 'right', 'top', 'bottom'].includes(over.id as string)) return;
    
    const activeContainer = layoutC_available.includes(active.id as string) ? 'available' : 'active';
    const overContainer = layoutC_available.includes(over.id as string) ? 'available' : (layoutC_active.includes(over.id as string) ? 'active' : null);

    if (!overContainer || activeContainer === overContainer) return;

    const activeItems = activeContainer === 'available' ? layoutC_available : layoutC_active;
    const overItems = overContainer === 'available' ? layoutC_available : layoutC_active;
    const activeIndex = activeItems.indexOf(active.id as string);
    const overIndex = overItems.indexOf(over.id as string);

    let newIndex = overIndex >= 0 ? overIndex : overItems.length + 1;

    if (activeContainer === 'available') {
      setLayoutC(
        layoutC_available.filter(id => id !== active.id),
        [...layoutC_active.slice(0, newIndex), active.id as string, ...layoutC_active.slice(newIndex)]
      );
    } else {
      setLayoutC(
        [...layoutC_available.slice(0, newIndex), active.id as string, ...layoutC_available.slice(newIndex)],
        layoutC_active.filter(id => id !== active.id)
      );
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

    const activeContainer = layoutC_available.includes(active.id as string) ? 'available' : 'active';
    const overContainer = layoutC_available.includes(over.id as string) ? 'available' : (layoutC_active.includes(over.id as string) ? 'active' : null);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const items = activeContainer === 'available' ? layoutC_available : layoutC_active;
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newArray = arrayMove(items, oldIndex, newIndex);
      
      if (activeContainer === 'available') {
        setLayoutC(newArray, layoutC_active);
      } else {
        setLayoutC(layoutC_available, newArray);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Palette Sidebar */}
        <div className="w-full sm:w-48 shrink-0 bg-gray-100 border-2 border-gray-200 p-4 rounded-lg print:hidden sm:min-h-[500px]">
          <h3 className="font-bold mb-4 text-sm text-gray-700 uppercase tracking-widest text-center">Palette</h3>
          <SortableContext items={layoutC_available} strategy={verticalListSortingStrategy}>
            {layoutC_available.map(id => (
              <SortableBlockC key={id} id={id} isPalette>{null}</SortableBlockC>
            ))}
            {layoutC_available.length === 0 && <div className="text-xs text-gray-400 text-center py-4">No blocks left</div>}
          </SortableContext>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <SortableContext items={layoutC_active} strategy={verticalListSortingStrategy}>
            {layoutC_active.map(id => (
              <SortableBlockC key={id} id={id}>
                {renderBlock(id)}
              </SortableBlockC>
            ))}
          </SortableContext>
          {layoutC_active.length === 0 && <div className="p-12 text-center border-4 border-dashed border-gray-200 text-gray-400 rounded-lg print:hidden">Drag blocks here from the Palette</div>}
        </div>
      </div>
    </DndContext>
  );
}

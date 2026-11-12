'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

export interface BaseDraggableItem {
  id: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export interface DraggableUnitListProps<T extends BaseDraggableItem> {
  items: T[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  onSelectItem?: (item: T, index: number) => void;
  selectedId?: string | null;
  onRemoveItem?: (item: T, index: number) => void;
  renderItem?: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  emptyMessage?: string;
  ariaLabel?: string;
}

interface SortableUnitRowProps<T extends BaseDraggableItem> {
  item: T;
  index: number;
  selected: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  renderItem?: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  itemClassName?: string;
}

function SortableUnitRow<T extends BaseDraggableItem>({
  item,
  index,
  selected,
  onSelect,
  onRemove,
  renderItem,
  itemClassName = '',
}: SortableUnitRowProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`draggable-unit-${item.id}`}
      onClick={onSelect}
      className={`group flex items-center gap-2 rounded-xl border p-2 text-xs transition duration-150 ${
        isDragging
          ? 'z-30 border-amber-500 bg-amber-50/90 shadow-xl ring-2 ring-amber-400'
          : selected
          ? 'border-amber-600 bg-amber-50/50 text-stone-900 shadow-sm'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
      } ${itemClassName}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none p-0.5 text-stone-400 hover:text-stone-700 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Kéo để sắp xếp: ${item.title ?? `Mục ${index + 1}`}`}
      >
        <GripVertical className="h-4 w-4 shrink-0" />
      </button>

      {renderItem ? (
        <div className="flex-1 min-w-0">{renderItem(item, index, isDragging)}</div>
      ) : (
        <div className="flex flex-1 items-center justify-between gap-2 truncate">
          <div className="truncate">
            <span className="font-semibold text-stone-800">
              {item.title ?? `Mục #${index + 1}`}
            </span>
            {item.subtitle && (
              <span className="ml-1.5 text-[11px] text-stone-500 truncate">
                {item.subtitle}
              </span>
            )}
          </div>
          {item.badge && (
            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
              {item.badge}
            </span>
          )}
        </div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded p-1 text-stone-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
          title="Xóa mục này"
          aria-label="Xóa mục"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function DraggableUnitList<T extends BaseDraggableItem>({
  items,
  onReorder,
  onSelectItem,
  selectedId,
  onRemoveItem,
  renderItem,
  className = 'space-y-1.5',
  itemClassName,
  emptyMessage = 'Chưa có mục nào.',
  ariaLabel = 'Danh sách có thể sắp xếp',
}: DraggableUnitListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 p-3 text-center text-xs text-stone-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className} aria-label={ariaLabel} role="list">
          {items.map((item, index) => (
            <SortableUnitRow
              key={item.id}
              item={item}
              index={index}
              selected={selectedId ? item.id === selectedId : false}
              onSelect={onSelectItem ? () => onSelectItem(item, index) : undefined}
              onRemove={
                onRemoveItem ? () => onRemoveItem(item, index) : undefined
              }
              renderItem={renderItem}
              itemClassName={itemClassName}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

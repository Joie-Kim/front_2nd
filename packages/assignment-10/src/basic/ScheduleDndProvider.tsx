import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { PropsWithChildren, useCallback } from 'react';
import { CellSize, DAY_LABELS } from './constants.ts';
import { useTableContext } from './TableContext.tsx';

function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    const containerTop = containerNodeRect?.top ?? 0;
    const containerLeft = containerNodeRect?.left ?? 0;
    const containerBottom = containerNodeRect?.bottom ?? 0;
    const containerRight = containerNodeRect?.right ?? 0;

    const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {};

    const minX = containerLeft - left + 120 + 1;
    const minY = containerTop - top + 40 + 1;
    const maxX = containerRight - right;
    const maxY = containerBottom - bottom;

    return {
      ...transform,
      x: Math.min(
        Math.max(
          Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH,
          minX
        ),
        maxX
      ),
      y: Math.min(
        Math.max(
          Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT,
          minY
        ),
        maxY
      ),
    };
  };
}

const modifiers = [createSnapModifier()];

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { tableId, schedules, updateSchedule } = useTableContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = useCallback(
    (event: any) => {
      console.log('hello');
      const { active, delta } = event;
      const { x, y } = delta;
      const [draggedTableId, index] = active.id.split(':');
      const seq = Number.parseInt(index);

      if (draggedTableId !== tableId || isNaN(seq)) {
        console.error('Invalid active id:', active.id);
        return;
      }

      const moveDayIndex = Math.floor(x / 80);
      const moveTimeIndex = Math.floor(y / 30);

      const updatedSchedules = schedules.map((schedule, scheduleIndex) => {
        if (scheduleIndex !== seq) return schedule;

        const currentDayIndex = DAY_LABELS.indexOf(
          schedule.day as (typeof DAY_LABELS)[number]
        );
        const newDayIndex =
          (currentDayIndex + moveDayIndex + DAY_LABELS.length) %
          DAY_LABELS.length;
        const newDay = DAY_LABELS[newDayIndex];
        const newRange = schedule.range.map((time) => time + moveTimeIndex);

        // Validate newRange to ensure it doesn't go out of bounds
        // const isValidRange = newRange.every((time) => time > 0 && time <= 24);
        // if (!isValidRange) {
        //   console.log('hello validation');
        //   return schedule; // If invalid, return the original schedule
        // }

        return { ...schedule, day: newDay, range: newRange };
      });

      updateSchedule(updatedSchedules);
    },
    [tableId, schedules, updateSchedule]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      {children}
    </DndContext>
  );
}

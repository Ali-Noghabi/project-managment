import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Column from './Column';
import Card from './Card';
import './Board.css';

const initialData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Take out the garbage' },
    'task-2': { id: 'task-2', content: 'Watch my favorite show' },
    'task-3': { id: 'task-3', content: 'Charge my phone' },
    'task-4': { id: 'task-4', content: 'Cook dinner' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To do',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: [],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

function Board() {
  const [state, setState] = useState(initialData);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const { id: activeId } = active;
    const { id: overId } = over;

    if (activeId !== overId) {
      const activeColumnId = Object.keys(state.columns).find(columnId => state.columns[columnId].taskIds.includes(activeId));
      const overColumnId = Object.keys(state.columns).find(columnId => state.columns[columnId].taskIds.includes(overId)) || overId;

      if (activeColumnId === overColumnId) {
        const newTaskIds = arrayMove(
          state.columns[activeColumnId].taskIds,
          state.columns[activeColumnId].taskIds.indexOf(activeId),
          state.columns[activeColumnId].taskIds.indexOf(overId)
        );

        const newColumn = {
          ...state.columns[activeColumnId],
          taskIds: newTaskIds,
        };

        setState((prev) => ({
          ...prev,
          columns: {
            ...prev.columns,
            [newColumn.id]: newColumn,
          },
        }));
      } else {
        const activeTaskIds = state.columns[activeColumnId].taskIds.filter(id => id !== activeId);
        const overTaskIds = Array.from(state.columns[overColumnId].taskIds);
        const overIndex = over.id in state.tasks ? state.columns[overColumnId].taskIds.indexOf(overId) : state.columns[overColumnId].taskIds.length;
        overTaskIds.splice(overIndex, 0, activeId);

        setState((prev) => ({
          ...prev,
          columns: {
            ...prev.columns,
            [activeColumnId]: {
              ...state.columns[activeColumnId],
              taskIds: activeTaskIds,
            },
            [overColumnId]: {
              ...state.columns[overColumnId],
              taskIds: overTaskIds,
            },
          },
        }));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        {state.columnOrder.map(columnId => {
          const column = state.columns[columnId];
          const tasks = column.taskIds.map(taskId => state.tasks[taskId]);

          return (
            <SortableContext key={column.id} items={column.taskIds} strategy={verticalListSortingStrategy}>
              <Column key={column.id} column={column} tasks={tasks} />
            </SortableContext>
          );
        })}
      </div>
      <DragOverlay>
        {activeId ? (
          <Card task={state.tasks[activeId]} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default Board;

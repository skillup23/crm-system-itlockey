'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const COLUMNS = [
  {
    id: 'Открыта',
    title: 'Открыта',
    color: 'border-t-blue-500',
    countBg: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'В работе',
    title: 'В работе',
    color: 'border-t-amber-500',
    countBg: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'Ожидание',
    title: 'Ожидание',
    color: 'border-t-purple-500',
    countBg: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'Закрыта',
    title: 'Закрыта',
    color: 'border-t-emerald-500',
    countBg: 'bg-emerald-100 text-emerald-800',
  },
];

export default function TaskKanbanBoard({
  tasks,
  onTaskStatusChange,
  getDeadlineStatus,
}) {
  // Для оптимистичного мгновенного отображения во время drag-and-drop
  const [optimisticOverrides, setOptimisticOverrides] = useState({});

  // Группируем задачи на лету во время рендера без вызова useEffect
  const boardData = {
    Открыта: [],
    'В работе': [],
    Ожидание: [],
    Закрыта: [],
  };

  tasks.forEach((task) => {
    const currentStatus = optimisticOverrides[task._id] || task.status;
    if (boardData[currentStatus]) {
      boardData[currentStatus].push({ ...task, status: currentStatus });
    }
  });

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const destCol = destination.droppableId;

    // Мгновенно применяем статус локально
    setOptimisticOverrides((prev) => ({
      ...prev,
      [draggableId]: destCol,
    }));

    // Отправляем запрос на сервер
    try {
      await onTaskStatusChange(draggableId, destCol);
    } finally {
      // Очищаем временный оверрайд, так как родитель уже обновил пропс tasks
      setOptimisticOverrides((prev) => {
        const next = { ...prev };
        delete next[draggableId];
        return next;
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pb-6">
        {COLUMNS.map((col) => {
          const colTasks = boardData[col.id] || [];

          return (
            <div
              key={col.id}
              className={`bg-slate-100/80 rounded-xl border border-slate-200 border-t-4 ${col.color} p-3 flex flex-col min-h-[600px] shadow-sm`}
            >
              {/* Шапка колонки */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <span className="font-bold text-sm text-slate-800 tracking-wide">
                  {col.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.countBg}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Зона сброса карточек */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2.5 transition-colors rounded-lg p-1 ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-50/60 ring-2 ring-blue-300 ring-dashed'
                        : ''
                    }`}
                  >
                    {colTasks.map((task, index) => {
                      const deadlineAlert = getDeadlineStatus
                        ? getDeadlineStatus(task.todoDeadline, task.status)
                        : null;

                      return (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm transition-shadow select-none group hover:border-slate-300 ${
                                dragSnapshot.isDragging
                                  ? 'shadow-xl ring-2 ring-blue-500 rotate-1'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[150px]">
                                  {task.company}
                                </span>
                                {deadlineAlert && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${deadlineAlert.text} bg-white`}
                                  >
                                    {deadlineAlert.label}
                                  </span>
                                )}
                              </div>

                              <Link
                                href={`/tasks/${task._id}`}
                                className="block font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2"
                              >
                                {task.title}
                              </Link>

                              {task.description && (
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="truncate max-w-[130px] font-medium text-slate-600">
                                  {task.executors?.length > 0
                                    ? task.executors
                                        .map((e) => e.name)
                                        .join(', ')
                                    : 'Без исполнителя'}
                                </span>

                                <div className="flex items-center gap-2">
                                  {task.comments?.length > 0 && (
                                    <span title="Комментарии">
                                      💬 {task.comments.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

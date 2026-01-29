import React from 'react'
import TaskCard from './TaskCard.jsx'

// Renders a group of tasks inside a time block (Morning/Afternoon/Evening).
export default function TimeBlock({
  title,
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}) {
  return (
    <section className="timeBlock">
      <div className="timeBlock__header">
        <h2 className="timeBlock__title">{title}</h2>
        <span className="timeBlock__count">{tasks.length} task(s)</span>
      </div>

      {tasks.length === 0 ? (
        <div className="emptyState">No tasks here yet.</div>
      ) : (
        <div className="timeBlock__grid">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ))}
        </div>
      )}
    </section>
  )
}

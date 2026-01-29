import React from 'react'

// Task card used across Today/Dashboard views.
export default function TaskCard({ task, onToggleComplete, onDeleteTask, onEditTask }) {
  const priorityClass = String(task.priority || '').toLowerCase()
  const statusClass = task.completed ? 'pill--statusDone' : 'pill--statusPending'
  const statusText = task.completed ? 'Completed' : 'Pending'

  return (
    <article className={task.completed ? 'taskCard taskCard--done' : 'taskCard'}>
      <div className="taskCard__top">
        <div className="taskCard__titleRow">
          <h3 className="taskCard__title">{task.title}</h3>
          <div className="pillRow">
            <span className={`pill ${statusClass}`}>{statusText}</span>
            <span className={`pill pill--${priorityClass}`}>{task.priority}</span>
          </div>
        </div>

        {task.description ? (
          <p className="taskCard__desc">{task.description}</p>
        ) : null}
      </div>

      <div className="taskCard__bottom">
        <div className="taskMeta">
          <span className="taskMeta__item">⏱ {task.estimatedTime || '—'}</span>
          <span className="taskMeta__item">📌 {task.timeBlock}</span>
        </div>

        <div className="taskActions">
          {onEditTask ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => onEditTask(task)}
            >
              Edit
            </button>
          ) : null}

          <button
            type="button"
            className={task.completed ? 'btn btn--ghost' : 'btn btn--primary'}
            onClick={() => onToggleComplete(task.id)}
          >
            {task.completed ? 'Mark Pending' : 'Complete'}
          </button>

          <button
            type="button"
            className="btn btn--dangerGhost"
            onClick={() => onDeleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

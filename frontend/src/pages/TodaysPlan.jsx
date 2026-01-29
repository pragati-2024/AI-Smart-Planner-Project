import React, { useMemo, useState } from 'react'
import { groupTasksByTimeBlock, TIME_BLOCKS } from '../utils/ai.js'
import TimeBlock from '../components/TimeBlock.jsx'
import TaskEditModal from '../components/TaskEditModal.jsx'

// Today’s Plan page: shows tasks grouped into time blocks.
export default function TodaysPlan({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
}) {
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortMode, setSortMode] = useState('Newest')
  const [editingTask, setEditingTask] = useState(null)

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = tasks

    if (q) {
      list = list.filter((t) => {
        const hay = `${t.title || ''} ${t.description || ''}`.toLowerCase()
        return hay.includes(q)
      })
    }

    if (priorityFilter !== 'All') {
      list = list.filter((t) => String(t.priority) === priorityFilter)
    }

    if (statusFilter !== 'All') {
      const wantDone = statusFilter === 'Completed'
      list = list.filter((t) => Boolean(t.completed) === wantDone)
    }

    const sorted = [...list]
    if (sortMode === 'Oldest') {
      sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    } else if (sortMode === 'Title') {
      sorted.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
    } else {
      sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    }
    return sorted
  }, [priorityFilter, query, sortMode, statusFilter, tasks])

  const grouped = useMemo(() => groupTasksByTimeBlock(visibleTasks), [visibleTasks])

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Today’s Plan</h2>
          <p className="pageSubtitle">
            Your day in three calm blocks: morning, afternoon, evening.
          </p>
        </div>

        <div className="filters">
          <div className="filters__row">
            <div className="filters__search">
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks…"
                aria-label="Search tasks"
              />
            </div>

            <select
              className="select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>

            <select
              className="select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              aria-label="Sort tasks"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Title</option>
            </select>
          </div>

          <div className="filters__meta">
            Showing <strong>{visibleTasks.length}</strong> of {tasks.length}
          </div>
        </div>
      </div>

      <div className="blocks">
        {TIME_BLOCKS.map((block) => (
          <TimeBlock
            key={block}
            title={block}
            tasks={grouped[block] || []}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            onEditTask={(t) => setEditingTask(t)}
          />
        ))}
      </div>

      {editingTask ? (
        <TaskEditModal
          task={editingTask}
          onCancel={() => setEditingTask(null)}
          onSave={(updated) => {
            onUpdateTask(updated)
            setEditingTask(null)
          }}
        />
      ) : null}
    </div>
  )
}

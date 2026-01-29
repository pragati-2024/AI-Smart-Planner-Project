import React, { useMemo, useState } from 'react'

// Add Task form page.
export default function AddTask({ onAddTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('High')
  const [estimatedTime, setEstimatedTime] = useState('30 mins')
  const [error, setError] = useState('')

  const suggestedBlock = useMemo(() => {
    const p = String(priority).toLowerCase()
    if (p === 'high') return 'Morning'
    if (p === 'medium') return 'Afternoon'
    return 'Evening'
  }, [priority])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a task title.')
      return
    }

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      estimatedTime: estimatedTime.trim(),
    })

    // Reset the form for fast task entry.
    setTitle('')
    setDescription('')
    setPriority('High')
    setEstimatedTime('30 mins')
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Add Task</h2>
          <p className="pageSubtitle">
            Tasks are stored locally in your browser (localStorage).
          </p>
        </div>
      </div>

      <div className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <div className="formRow">
            <label className="label">
              Task title
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Finish project report"
              />
            </label>
          </div>

          <div className="formRow">
            <label className="label">
              Description
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details…"
                rows={4}
              />
            </label>
          </div>

          <div className="formRow formRow--two">
            <label className="label">
              Priority
              <select
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <div className="helpText">AI suggestion: {suggestedBlock}</div>
            </label>

            <label className="label">
              Estimated time
              <input
                className="input"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g., 45 mins"
              />
            </label>
          </div>

          {error ? <div className="formError">{error}</div> : null}

          <div className="formActions">
            <button className="btn btn--primary" type="submit">
              Add Task
            </button>
            <div className="formHint">
              The task will be assigned to <strong>{suggestedBlock}</strong>.
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

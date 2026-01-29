import React, { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { getTimeBlockFromPriority } from '../utils/ai.js'

export default function TaskEditModal({ task, onCancel, onSave }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'Medium')
  const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime || '')

  const suggestedBlock = useMemo(
    () => getTimeBlockFromPriority(priority),
    [priority],
  )

  function submit(e) {
    e.preventDefault()

    const cleanTitle = title.trim()
    if (!cleanTitle) return

    onSave({
      ...task,
      title: cleanTitle,
      description: description.trim(),
      priority,
      estimatedTime: estimatedTime.trim(),
      timeBlock: suggestedBlock,
    })
  }

  return (
    <Modal title="Edit task" onClose={onCancel}>
      <form className="form" onSubmit={submit}>
        <div className="formRow">
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
            maxLength={80}
          />
          <div className="helpText">Keep it short and specific.</div>
        </div>

        <div className="formRow">
          <label className="label">Description (optional)</label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a quick note…"
            maxLength={240}
          />
        </div>

        <div className="formGrid">
          <div className="formRow">
            <label className="label">Priority</label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="formRow">
            <label className="label">Estimated time</label>
            <input
              className="input"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 30 mins"
              maxLength={24}
            />
            <div className="helpText">Suggested: {suggestedBlock}</div>
          </div>
        </div>

        <div className="modalActions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={!title.trim()}>
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

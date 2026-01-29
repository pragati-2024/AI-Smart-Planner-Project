import React, { useMemo, useRef, useState } from 'react'

// Progress page: simple summary of total/completed/pending tasks.
export default function Progress({
  tasks,
  onClearCompleted,
  onClearAll,
  onImportTasks,
}) {
  const fileRef = useRef(null)
  const [importError, setImportError] = useState('')

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const pending = total - completed
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

    return { total, completed, pending, percent }
  }, [tasks])

  function exportBackup() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-smart-planner-backup.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function onFileSelected(e) {
    setImportError('')
    try {
      const file = e.target.files?.[0]
      if (!file) return
      const text = await file.text()
      const parsed = JSON.parse(text)
      const importedTasks = Array.isArray(parsed) ? parsed : parsed?.tasks
      if (!Array.isArray(importedTasks)) {
        throw new Error('Invalid backup format. Expected a JSON array or { tasks: [] }.')
      }
      onImportTasks(importedTasks)
    } catch (err) {
      setImportError(err?.message || 'Import failed.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Progress</h2>
          <p className="pageSubtitle">A quick snapshot of your momentum.</p>
        </div>

        <div className="pageActions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={exportBackup}
            disabled={stats.total === 0}
            aria-disabled={stats.total === 0}
          >
            Download Backup
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="fileInput"
            onChange={onFileSelected}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => fileRef.current?.click()}
          >
            Import Backup
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClearCompleted}
            disabled={stats.completed === 0}
            aria-disabled={stats.completed === 0}
          >
            Clear Completed
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onClearAll}
            disabled={stats.total === 0}
            aria-disabled={stats.total === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          {importError ? <div className="formError">{importError}</div> : null}

          <div className="statGrid">
            <div className="stat">
              <div className="stat__label">Total</div>
              <div className="stat__value">{stats.total}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Completed</div>
              <div className="stat__value">{stats.completed}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Pending</div>
              <div className="stat__value">{stats.pending}</div>
            </div>
          </div>

          <div className="progressBar">
            <div className="progressBar__top">
              <span>Completion</span>
              <strong>{stats.percent}%</strong>
            </div>
            <div className="progressBar__track" aria-label="Completion progress">
              <div
                className="progressBar__fill"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="panel panel--soft">
          <h3 className="panelTitle">Tip</h3>
          <p className="muted">
            Keep <strong>High</strong> priority items small and specific so they
            fit cleanly into the morning.
          </p>
        </div>
      </div>
    </div>
  )
}

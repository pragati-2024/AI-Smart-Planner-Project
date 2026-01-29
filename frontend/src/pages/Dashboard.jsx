import React, { useMemo } from 'react'
import { groupTasksByTimeBlock, TIME_BLOCKS } from '../utils/ai.js'

// Dashboard page: quick overview + upcoming tasks by block.
export default function Dashboard({ tasks }) {
  const { total, completed, pending } = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.completed).length
    return {
      total: totalTasks,
      completed: completedTasks,
      pending: totalTasks - completedTasks,
    }
  }, [tasks])

  const grouped = useMemo(() => groupTasksByTimeBlock(tasks), [tasks])

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Dashboard</h2>
          <p className="pageSubtitle">Your day at a glance.</p>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          <h3 className="panelTitle">Summary</h3>
          <div className="summaryGrid">
            <div className="summaryCard summaryCard--total">
              <div className="summaryCard__meta">
                <div className="summaryCard__label">Total tasks</div>
                <div className="summaryCard__value">{total}</div>
              </div>
              <div className="summaryIcon" aria-hidden="true">📋</div>
            </div>

            <div className="summaryCard summaryCard--done">
              <div className="summaryCard__meta">
                <div className="summaryCard__label">Completed</div>
                <div className="summaryCard__value">{completed}</div>
              </div>
              <div className="summaryIcon" aria-hidden="true">✅</div>
            </div>

            <div className="summaryCard summaryCard--pending">
              <div className="summaryCard__meta">
                <div className="summaryCard__label">Pending</div>
                <div className="summaryCard__value">{pending}</div>
              </div>
              <div className="summaryIcon" aria-hidden="true">⏳</div>
            </div>
          </div>
        </div>

        <div className="panel panel--soft">
          <h3 className="panelTitle">Today’s focus</h3>
          <p className="muted">
            Add a few tasks and let the simple AI place them into time blocks.
          </p>
          <div className="miniBlocks">
            {TIME_BLOCKS.map((block) => (
              <div className="miniBlock" key={block}>
                <div className="miniBlock__title">{block}</div>
                <div className="miniBlock__value">{(grouped[block] || []).length}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="panelTitle">Upcoming (pending)</h3>
        {pending === 0 ? (
          <div className="emptyState">All done — nice work.</div>
        ) : (
          <div className="list">
            {tasks
              .filter((t) => !t.completed)
              .slice(0, 6)
              .map((t) => (
                <div className="listItem" key={t.id}>
                  <div className="listItem__main">
                    <div className="listItem__title">{t.title}</div>
                    <div className="listItem__meta">
                      {t.priority} • {t.timeBlock} • {t.estimatedTime || '—'}
                    </div>
                  </div>
                  <div className="pill pill--neutral">Pending</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

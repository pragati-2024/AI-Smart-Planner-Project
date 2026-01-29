import React, { useEffect } from 'react'

function pointsForPriority(priority) {
  const normalized = String(priority || '').toLowerCase()
  if (normalized === 'high') return 30
  if (normalized === 'medium') return 20
  return 10
}

export default function RewardToast({ reward, onClose }) {
  useEffect(() => {
    const t = window.setTimeout(() => onClose(), 2600)
    return () => window.clearTimeout(t)
  }, [reward?.id, onClose])

  if (!reward) return null

  const kind = reward.kind || 'task'
  const pts = reward.points ?? pointsForPriority(reward.priority)
  const title =
    kind === 'theme'
      ? reward.title || 'Theme unlocked'
      : 'Task completed'
  const text =
    kind === 'theme'
      ? reward.subtitle || 'Open Themes to apply it.'
      : `+${pts} points • ${reward.title || 'Nice work'}`

  return (
    <div className="toast" role="status" aria-live="polite">
      <div className="toast__icon" aria-hidden="true">
        {kind === 'theme' ? '🎁' : '✨'}
      </div>
      <div className="toast__content">
        <div className="toast__title">{title}</div>
        <div className="toast__text">{text}</div>
      </div>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { THEMES, themeLabel } from '../utils/theme.js'

function meetsRequirement(theme, stats) {
  const points = Number(stats?.totalPoints || 0)
  const streak = Number(stats?.streak || 0)
  const needPoints = Number(theme?.require?.points || 0)
  const needStreak = Number(theme?.require?.streak || 0)

  if (needPoints && points < needPoints) return false
  if (needStreak && streak < needStreak) return false
  return true
}

function requirementText(theme) {
  const needPoints = Number(theme?.require?.points || 0)
  const needStreak = Number(theme?.require?.streak || 0)
  const parts = []
  if (needPoints) parts.push(`${needPoints} points`)
  if (needStreak) parts.push(`${needStreak}-day streak`)
  return parts.length ? `Unlock: ${parts.join(' + ')}` : 'Unlocked'
}

export default function ThemePickerModal({
  currentTheme,
  stats,
  unlockedThemes,
  onApplyTheme,
  onClose,
}) {
  const [tab, setTab] = useState('Coder')

  const groups = useMemo(() => {
    const coder = THEMES.filter((t) => t.group === 'Coder')
    const fun = THEMES.filter((t) => t.group === 'Fun')
    const base = THEMES.filter((t) => t.group === 'Base')
    return { Base: base, Coder: coder, Fun: fun }
  }, [])

  const list = groups[tab] || groups.Coder
  const unlockedSet = useMemo(() => new Set(unlockedThemes || []), [unlockedThemes])

  return (
    <Modal title="Themes" onClose={onClose}>
      <div className="themeTop">
        <div className="themeStats">
          <div className="themeStat">
            <div className="themeStat__label">Points</div>
            <div className="themeStat__value">{Number(stats?.totalPoints || 0)}</div>
          </div>
          <div className="themeStat">
            <div className="themeStat__label">Streak</div>
            <div className="themeStat__value">{Number(stats?.streak || 0)} days</div>
          </div>
          <div className="themeStat">
            <div className="themeStat__label">Current</div>
            <div className="themeStat__value">{themeLabel(currentTheme)}</div>
          </div>
        </div>

        <div className="themeTabs" role="tablist" aria-label="Theme categories">
          {['Coder', 'Fun', 'Base'].map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? 'themeTab themeTab--active' : 'themeTab'}
              onClick={() => setTab(t)}
              role="tab"
              aria-selected={tab === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="themeGrid">
        {list.map((theme) => {
          const isUnlocked = unlockedSet.has(theme.id) || meetsRequirement(theme, stats)
          const isActive = currentTheme === theme.id

          return (
            <button
              key={theme.id}
              type="button"
              className={
                isActive
                  ? 'themeCard themeCard--active'
                  : isUnlocked
                    ? 'themeCard'
                    : 'themeCard themeCard--locked'
              }
              onClick={() => {
                if (!isUnlocked) return
                onApplyTheme(theme.id)
                onClose()
              }}
              aria-label={isUnlocked ? `Apply ${theme.name}` : `${theme.name} locked`}
            >
              <div className="themeCard__top">
                <div className="themeCard__name">{theme.name}</div>
                <div className="themeCard__pill">
                  {isActive ? 'Active' : isUnlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
              <div className="themeCard__desc">{theme.description}</div>
              <div className="themeCard__req">{isUnlocked ? 'Click to apply' : requirementText(theme)}</div>
            </button>
          )
        })}
      </div>

      <div className="modalActions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

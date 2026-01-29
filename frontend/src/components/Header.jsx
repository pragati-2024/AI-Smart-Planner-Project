import React from 'react'

// Header contains the app title + mobile menu toggle.
export default function Header({
  onToggleSidebar,
  isSidebarOpen,
  user,
  theme,
  onOpenThemes,
  stats,
  onLogout,
}) {
  return (
    <header className="header">
      <button
        className="iconButton header__menuBtn"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        type="button"
      >
        {/* Simple hamburger icon */}
        <span className="hamburger" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div className="header__titleWrap">
        <h1 className="header__title">AI Smart Daily Planner</h1>
        <p className="header__subtitle">Plan smarter. Execute calmly.</p>
      </div>

      <div className="header__right">
        <button
          type="button"
          className="btn btn--ghost headerBtn"
          onClick={onOpenThemes}
          aria-label="Open theme picker"
        >
          Themes
        </button>

        <div className="headerStat" title="Points and streak">
          <span className="headerStat__pill">⭐ {Number(stats?.totalPoints || 0)}</span>
          <span className="headerStat__pill">🔥 {Number(stats?.streak || 0)}</span>
        </div>

        <div className="userChip" title={user?.email || ''}>
          <div className="userChip__dot" aria-hidden="true" />
          <div className="userChip__name">{user?.name || 'User'}</div>
        </div>

        <button type="button" className="btn btn--dangerGhost headerBtn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

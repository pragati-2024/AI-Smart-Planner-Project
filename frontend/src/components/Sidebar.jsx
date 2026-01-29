import React from 'react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'today', label: "Today’s Plan" },
  { key: 'add', label: 'Add Task' },
  { key: 'progress', label: 'Progress' },
]

// Sidebar navigation for switching between app views.
export default function Sidebar({ activeView, onNavigate, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={isOpen ? 'sidebarOverlay sidebarOverlay--open' : 'sidebarOverlay'}
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close sidebar"
      />

      <aside className={isOpen ? 'sidebar sidebar--open' : 'sidebar sidebar--hidden'}>
        <div className="sidebar__brand">
          <div className="sidebar__badge">AI</div>
          <div>
            <div className="sidebar__brandTitle">Smart Planner</div>
            <div className="sidebar__brandMeta">Local • Private • Fast</div>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.key
            return (
              <button
                key={item.key}
                type="button"
                className={isActive ? 'navItem navItem--active' : 'navItem'}
                onClick={() => onNavigate(item.key)}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="tipCard">
            <div className="tipCard__title">AI Scheduling Rule</div>
            <div className="tipCard__text">
              High → Morning, Medium → Afternoon, Low → Evening.
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

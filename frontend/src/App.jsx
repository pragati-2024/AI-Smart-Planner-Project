import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TodaysPlan from './pages/TodaysPlan.jsx'
import AddTask from './pages/AddTask.jsx'
import Progress from './pages/Progress.jsx'
import Login from './pages/Login.jsx'
import RewardToast from './components/RewardToast.jsx'
import ThemePickerModal from './components/ThemePickerModal.jsx'
import { getTimeBlockFromPriority } from './utils/ai.js'
import { loadTasks, saveTasks } from './utils/storage.js'
import { clearUser, loadUser, saveUser } from './utils/auth.js'
import { applyTheme, loadTheme, saveTheme, THEMES } from './utils/theme.js'
import { awardCompletion, loadStats, saveStats } from './utils/gamification.js'
import './styles/app.css'

// Main app shell.
// Uses a simple view-state router (no external libs) for this project.
export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 768 : true,
  )
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  )
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [reward, setReward] = useState(null)
  const [stats, setStats] = useState({
    totalPoints: 0,
    streak: 0,
    lastCompletionDate: null,
    unlockedThemes: ['light', 'dark'],
  })
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

  const tasksStorageKey = useMemo(() => {
    if (!user?.email) return null
    return `ai-smart-daily-planner.tasks.v1::${String(user.email).toLowerCase()}`
  }, [user])

  const statsStorageKey = useMemo(() => {
    if (!user?.email) return null
    return `ai-smart-daily-planner.stats.v1::${String(user.email).toLowerCase()}`
  }, [user])

  // Load user + theme on first mount.
  useEffect(() => {
    const loadedUser = loadUser()
    setUser(loadedUser)

    const loadedTheme = loadTheme()
    setTheme(loadedTheme)
    applyTheme(loadedTheme)
  }, [])

  // Load stats whenever user changes.
  useEffect(() => {
    if (!statsStorageKey) {
      setStats({
        totalPoints: 0,
        streak: 0,
        lastCompletionDate: null,
        unlockedThemes: ['light', 'dark'],
      })
      return
    }
    setStats(loadStats(statsStorageKey))
  }, [statsStorageKey])

  // Persist stats.
  useEffect(() => {
    if (!statsStorageKey) return
    saveStats(statsStorageKey, stats)
  }, [stats, statsStorageKey])

  // Track breakpoint for sidebar behavior.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(max-width: 768px)')

    const update = () => {
      setIsMobile(media.matches)
      setIsSidebarOpen(!media.matches)
    }

    update()

    if (media.addEventListener) {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  // Load tasks whenever user changes.
  useEffect(() => {
    if (!tasksStorageKey) {
      setTasks([])
      return
    }
    setTasks(loadTasks(tasksStorageKey))
  }, [tasksStorageKey])

  // Persist tasks to localStorage whenever tasks change.
  useEffect(() => {
    if (!tasksStorageKey) return
    saveTasks(tasksStorageKey, tasks)
  }, [tasks, tasksStorageKey])

  function navigate(viewKey) {
    setActiveView(viewKey)
    if (isMobile) setIsSidebarOpen(false)
  }

  function handleLogin(nextUser) {
    setUser(nextUser)
    saveUser(nextUser)
    setActiveView('dashboard')
  }

  function handleLogout() {
    const ok = window.confirm('Logout?')
    if (!ok) return
    clearUser()
    setUser(null)
    setActiveView('dashboard')
    setIsSidebarOpen(!isMobile)
    setIsThemeModalOpen(false)
  }

  function applyThemeIfAllowed(nextThemeId) {
    const unlocked = new Set(stats.unlockedThemes || ['light', 'dark'])
    if (!unlocked.has(nextThemeId)) return
    setTheme(nextThemeId)
    saveTheme(nextThemeId)
    applyTheme(nextThemeId)
  }

  // If a theme is set that isn't unlocked for this user, fall back.
  useEffect(() => {
    if (!user) return
    const unlocked = new Set(stats.unlockedThemes || ['light', 'dark'])
    if (!unlocked.has(theme)) {
      setTheme('dark')
      saveTheme('dark')
      applyTheme('dark')
    }
  }, [stats.unlockedThemes, theme, user])

  function maybeUnlockThemes(nextStats) {
    const unlocked = new Set(nextStats.unlockedThemes || ['light', 'dark'])
    const points = Number(nextStats.totalPoints || 0)
    const streak = Number(nextStats.streak || 0)

    let didUnlock = false
    for (const t of THEMES) {
      if (unlocked.has(t.id)) continue
      const needPoints = Number(t?.require?.points || 0)
      const needStreak = Number(t?.require?.streak || 0)
      const okPoints = !needPoints || points >= needPoints
      const okStreak = !needStreak || streak >= needStreak
      if (okPoints && okStreak) {
        unlocked.add(t.id)
        didUnlock = true
        setReward({
          id: Date.now(),
          kind: 'theme',
          title: `Theme unlocked: ${t.name}`,
          subtitle: 'Open Themes to apply it.',
        })
      }
    }

    if (!didUnlock) return nextStats
    return { ...nextStats, unlockedThemes: Array.from(unlocked) }
  }

  function addTask({ title, description, priority, estimatedTime }) {
    // Create a simple stable id without external dependencies.
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const timeBlock = getTimeBlockFromPriority(priority)

    const newTask = {
      id,
      title,
      description,
      priority,
      estimatedTime,
      timeBlock,
      completed: false,
      createdAt: Date.now(),
    }

    setTasks((prev) => [newTask, ...prev])
    setActiveView('today')
    if (isMobile) setIsSidebarOpen(false)
  }

  function toggleComplete(taskId) {
    setTasks((prev) => {
      let rewardPayload = null
      let statsAward = null

      const next = prev.map((t) => {
        if (t.id !== taskId) return t

        const nextCompleted = !t.completed
        const alreadyRewarded = Boolean(t.rewardedAt)

        if (!t.completed && nextCompleted && !alreadyRewarded) {
          const normalized = String(t.priority || '').toLowerCase()
          const points = normalized === 'high' ? 30 : normalized === 'medium' ? 20 : 10
          rewardPayload = {
            id: Date.now(),
            kind: 'task',
            title: t.title,
            priority: t.priority,
            points,
          }
          statsAward = points
        }

        // Prevent points farming: only award once per task.
        const rewardedAt = !t.completed && nextCompleted && !alreadyRewarded ? Date.now() : t.rewardedAt

        return { ...t, completed: nextCompleted, rewardedAt }
      })

      if (rewardPayload) setReward(rewardPayload)

      if (statsAward) {
        setStats((s) => {
          const updated = awardCompletion(s, statsAward)
          return maybeUnlockThemes(updated)
        })
      }
      return next
    })
  }

  function updateTask(updatedTask) {
    if (!updatedTask?.id) return
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
  }

  function deleteTask(taskId) {
    const task = tasks.find((t) => t.id === taskId)
    const ok = window.confirm(
      `Delete this task?${task?.title ? `\n\n${task.title}` : ''}`,
    )
    if (!ok) return
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  function clearCompletedTasks() {
    const completedCount = tasks.filter((t) => t.completed).length
    if (completedCount === 0) return
    const ok = window.confirm(`Clear ${completedCount} completed task(s)?`)
    if (!ok) return
    setTasks((prev) => prev.filter((t) => !t.completed))
  }

  function clearAllTasks() {
    if (tasks.length === 0) return
    const ok = window.confirm(
      `Clear ALL tasks?\n\nThis will remove ${tasks.length} task(s).`,
    )
    if (!ok) return
    setTasks([])
  }

  function importTasks(nextTasks) {
    if (!Array.isArray(nextTasks)) return
    const normalized = nextTasks
      .filter(Boolean)
      .map((t) => {
        const id = t.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`
        const title = String(t.title || '').trim()
        const priority = String(t.priority || 'Medium')
        const timeBlock = t.timeBlock || getTimeBlockFromPriority(priority)
        return {
          id,
          title,
          description: String(t.description || ''),
          priority,
          estimatedTime: String(t.estimatedTime || ''),
          timeBlock,
          completed: Boolean(t.completed),
          createdAt: Number(t.createdAt || Date.now()),
        }
      })
      .filter((t) => t.title)

    const ok = window.confirm(
      `Import backup and replace your current list?\n\nThis will replace ${tasks.length} task(s).`,
    )
    if (!ok) return
    setTasks(normalized)
    setActiveView('today')
    if (isMobile) setIsSidebarOpen(false)
  }

  const content = useMemo(() => {
    if (!user) {
      return <Login onLogin={handleLogin} />
    }
    if (activeView === 'today') {
      return (
        <TodaysPlan
          tasks={tasks}
          onToggleComplete={toggleComplete}
          onDeleteTask={deleteTask}
          onUpdateTask={updateTask}
        />
      )
    }
    if (activeView === 'add') {
      return <AddTask onAddTask={addTask} />
    }
    if (activeView === 'progress') {
      return (
        <Progress
          tasks={tasks}
          onClearCompleted={clearCompletedTasks}
          onClearAll={clearAllTasks}
          onImportTasks={importTasks}
        />
      )
    }
    return <Dashboard tasks={tasks} />
  }, [activeView, isMobile, tasks, user])

  return (
    <div className="appShell">
      {user ? (
        <div
          className={
            isSidebarOpen ? 'shellGrid' : 'shellGrid shellGrid--sidebarClosed'
          }
        >
          <Sidebar
            activeView={activeView}
            onNavigate={navigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className="main">
            <Header
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((s) => !s)}
              user={user}
              theme={theme}
              onOpenThemes={() => setIsThemeModalOpen(true)}
              stats={stats}
              onLogout={handleLogout}
            />

            <main className="content">{content}</main>
          </div>
        </div>
      ) : (
        <main>{content}</main>
      )}

      {user && reward ? (
        <RewardToast reward={reward} onClose={() => setReward(null)} />
      ) : null}

      {user && isThemeModalOpen ? (
        <ThemePickerModal
          currentTheme={theme}
          stats={stats}
          unlockedThemes={stats.unlockedThemes}
          onApplyTheme={applyThemeIfAllowed}
          onClose={() => setIsThemeModalOpen(false)}
        />
      ) : null}
    </div>
  )
}

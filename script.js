/*
  AI Smart Daily Planner - Frontend Logic
  -------------------------------------------------
  Requirements implemented:
  - localStorage persistence for tasks
  - Add Task with client-side validation
  - Auto grouping based on priority:
      High   -> Morning
      Medium -> Afternoon
      Low    -> Evening
  - Mark task as completed
  - Simulate moving incomplete tasks to next day
  - Dynamic UI updates without page reload
*/

(() => {
  "use strict";

  // -----------------------------
  // Storage keys
  // -----------------------------
  const STORAGE_TASKS_KEY = "aiPlanner.tasks";
  const STORAGE_DATE_KEY = "aiPlanner.currentDate";
  const STORAGE_PREFS_KEY = "aiPlanner.prefs";

  // -----------------------------
  // DOM helpers
  // -----------------------------
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  // -----------------------------
  // Date helpers (local date)
  // -----------------------------
  function todayISO() {
    // yyyy-mm-dd (local)
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDaysISO(isoDate, days) {
    const [y, m, d] = isoDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function prettyDate(isoDate) {
    const [y, m, d] = isoDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }

  // -----------------------------
  // Task model
  // -----------------------------
  function generateId() {
    // Simple unique-ish ID for local usage
    return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function slotFromPriority(priority) {
    // AI grouping simulation
    if (priority === "High") return "morning";
    if (priority === "Medium") return "afternoon";
    return "evening";
  }

  function priorityBadgeClass(priority) {
    if (priority === "High") return "badge-high";
    if (priority === "Medium") return "badge-medium";
    return "badge-low";
  }

  // -----------------------------
  // Storage
  // -----------------------------
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_TASKS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }

  function loadActiveDate() {
    const stored = localStorage.getItem(STORAGE_DATE_KEY);
    return stored || todayISO();
  }

  function setActiveDate(isoDate) {
    localStorage.setItem(STORAGE_DATE_KEY, isoDate);
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_PREFS_KEY);
      if (!raw) return { reduceMotion: false, compact: false };
      const parsed = JSON.parse(raw);
      return {
        reduceMotion: !!parsed.reduceMotion,
        compact: !!parsed.compact,
      };
    } catch {
      return { reduceMotion: false, compact: false };
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  }

  // -----------------------------
  // App State
  // -----------------------------
  const state = {
    route: "dashboard",
    activeDate: loadActiveDate(),
    tasks: loadTasks(),
    prefs: loadPrefs(),
  };

  // -----------------------------
  // Routing (SPA-like)
  // -----------------------------
  function setRoute(route) {
    state.route = route;

    // Update visible section
    $$(".view").forEach((v) => v.classList.remove("is-visible"));
    const view = $(`#view-${route}`);
    if (view) view.classList.add("is-visible");

    // Update nav highlight
    $$(".nav-link").forEach((a) =>
      a.classList.toggle("is-active", a.dataset.route === route),
    );

    // Close sidebar on mobile
    closeSidebar();

    // Render on route changes
    renderAll();

    // Update hash (optional)
    const hashMap = {
      dashboard: "#dashboard",
      today: "#today",
      add: "#add",
      progress: "#progress",
      settings: "#settings",
    };
    if (hashMap[route]) history.replaceState(null, "", hashMap[route]);
  }

  function routeFromHash() {
    const hash = (location.hash || "").replace("#", "").toLowerCase();
    if (hash === "today") return "today";
    if (hash === "add") return "add";
    if (hash === "progress") return "progress";
    if (hash === "settings") return "settings";
    return "dashboard";
  }

  // -----------------------------
  // Sidebar behavior
  // -----------------------------
  function openSidebar() {
    document.body.classList.add("sidebar-open");
    const btn = $("#btnSidebar");
    if (btn) btn.setAttribute("aria-expanded", "true");
    const overlay = $("#overlay");
    if (overlay) overlay.hidden = false;
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
    const btn = $("#btnSidebar");
    if (btn) btn.setAttribute("aria-expanded", "false");
    const overlay = $("#overlay");
    if (overlay) overlay.hidden = true;
  }

  // -----------------------------
  // Validation
  // -----------------------------
  function setFieldError(id, message) {
    const el = $(`#${id}`);
    if (el) el.textContent = message || "";
  }

  function validateTaskForm(formData) {
    // Client-side validation rules
    const title = (formData.title || "").trim();
    const priority = formData.priority || "";
    const hoursStr = String(formData.hours ?? "").trim();
    const date = formData.date || "";

    let ok = true;

    setFieldError("errTitle", "");
    setFieldError("errPriority", "");
    setFieldError("errHours", "");
    setFieldError("errDate", "");

    if (title.length < 3) {
      setFieldError(
        "errTitle",
        "Please enter a task title (min 3 characters).",
      );
      ok = false;
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
      setFieldError("errPriority", "Please select a priority.");
      ok = false;
    }

    const hours = Number(hoursStr);
    if (!Number.isFinite(hours) || hours <= 0) {
      setFieldError("errHours", "Estimated time must be a positive number.");
      ok = false;
    } else if (hours > 24) {
      setFieldError("errHours", "Estimated time must be 24 hours or less.");
      ok = false;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFieldError("errDate", "Please choose a valid date.");
      ok = false;
    }

    return { ok, hours, title, priority, date };
  }

  // -----------------------------
  // Toast
  // -----------------------------
  let toastTimer = null;
  function showToast(title, text) {
    const toast = $("#toast");
    if (!toast) return;

    $("#toastTitle").textContent = title;
    $("#toastText").textContent = text;

    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }

  // -----------------------------
  // Rendering
  // -----------------------------
  function tasksForDate(isoDate) {
    return state.tasks
      .filter((t) => t.scheduledDate === isoDate)
      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
  }

  function computeKpis() {
    const all = state.tasks;
    const today = tasksForDate(state.activeDate);
    const todayTotal = today.length;
    const todayDone = today.filter((t) => t.completed).length;
    const completion =
      todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100);

    return { allTotal: all.length, todayTotal, todayDone, completion };
  }

  function renderHeaderDate() {
    const active = $("#activeDate");
    if (active) active.textContent = prettyDate(state.activeDate);

    const pill = $("#progressDayPill");
    if (pill) pill.textContent = prettyDate(state.activeDate);
  }

  function renderDashboard() {
    const { allTotal, todayTotal, completion } = computeKpis();

    $("#kpiTotal").textContent = String(allTotal);
    $("#kpiToday").textContent = String(todayTotal);
    $("#kpiCompletion").textContent = `${completion}%`;

    // Recent tasks (last 5 by createdAt)
    const recent = [...state.tasks]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 5);

    const container = $("#recentTasks");
    container.innerHTML = "";

    if (recent.length === 0) {
      container.appendChild(
        emptyState("No tasks yet. Add one to generate your plan."),
      );
      return;
    }

    for (const t of recent) {
      container.appendChild(renderListItem(t));
    }
  }

  function renderTodayPlan() {
    const morning = $("#slotMorning");
    const afternoon = $("#slotAfternoon");
    const evening = $("#slotEvening");

    morning.innerHTML = "";
    afternoon.innerHTML = "";
    evening.innerHTML = "";

    const tasks = tasksForDate(state.activeDate);

    const buckets = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    for (const t of tasks) {
      buckets[slotFromPriority(t.priority)].push(t);
    }

    const addBucket = (el, items, label) => {
      if (items.length === 0) {
        el.appendChild(emptyState(`No ${label} tasks scheduled.`));
        return;
      }
      items.forEach((t) => el.appendChild(renderTaskCard(t)));
    };

    addBucket(morning, buckets.morning, "morning");
    addBucket(afternoon, buckets.afternoon, "afternoon");
    addBucket(evening, buckets.evening, "evening");
  }

  function renderProgress() {
    const today = tasksForDate(state.activeDate);
    const total = today.length;
    const completed = today.filter((t) => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    $("#progressCompleted").textContent = String(completed);
    $("#progressTotal").textContent = String(total);
    $("#progressFill").style.width = `${pct}%`;

    const byPriority = (p) => {
      const list = today.filter((t) => t.priority === p);
      return {
        done: list.filter((t) => t.completed).length,
        total: list.length,
      };
    };

    const hi = byPriority("High");
    const med = byPriority("Medium");
    const low = byPriority("Low");

    $("#legendHigh").textContent = `${hi.done}/${hi.total}`;
    $("#legendMedium").textContent = `${med.done}/${med.total}`;
    $("#legendLow").textContent = `${low.done}/${low.total}`;

    // History: group by scheduledDate (latest first)
    const container = $("#historyList");
    container.innerHTML = "";

    if (state.tasks.length === 0) {
      container.appendChild(
        emptyState("No history yet. Add tasks to begin tracking progress."),
      );
      return;
    }

    const dates = Array.from(
      new Set(state.tasks.map((t) => t.scheduledDate)),
    ).sort((a, b) => (a < b ? 1 : -1));

    for (const d of dates.slice(0, 10)) {
      const items = state.tasks.filter((t) => t.scheduledDate === d);
      const done = items.filter((t) => t.completed).length;

      const row = document.createElement("div");
      row.className = "list-item";

      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "list-item-title";
      title.textContent = prettyDate(d);

      const sub = document.createElement("div");
      sub.className = "list-item-sub";
      sub.textContent = `${done}/${items.length} completed`;

      left.appendChild(title);
      left.appendChild(sub);

      const right = document.createElement("div");
      right.className = "pill";
      right.textContent = d === state.activeDate ? "Active day" : "History";

      row.appendChild(left);
      row.appendChild(right);
      container.appendChild(row);
    }
  }

  function renderSettings() {
    // Sync toggles
    const motion = $("#toggleMotion");
    const compact = $("#toggleCompact");

    if (motion) motion.checked = state.prefs.reduceMotion;
    if (compact) compact.checked = state.prefs.compact;

    document.body.classList.toggle("reduce-motion", state.prefs.reduceMotion);
    document.body.classList.toggle("is-compact", state.prefs.compact);
  }

  function renderAll() {
    renderHeaderDate();
    renderDashboard();
    renderTodayPlan();
    renderProgress();
    renderSettings();

    // Keep Add Task date aligned to active day
    const taskDate = $("#taskDate");
    if (taskDate && !taskDate.value) taskDate.value = state.activeDate;
  }

  // -----------------------------
  // UI builders
  // -----------------------------
  function emptyState(text) {
    const div = document.createElement("div");
    div.className = "list-item";
    div.style.justifyContent = "flex-start";
    div.textContent = text;
    return div;
  }

  function renderListItem(task) {
    const row = document.createElement("div");
    row.className = "list-item";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "list-item-title";
    title.textContent = task.title;

    const sub = document.createElement("div");
    sub.className = "list-item-sub";
    sub.textContent = `${task.priority} • ${task.estHours}h • ${prettyDate(task.scheduledDate)}${task.completed ? " • done" : ""}`;

    left.appendChild(title);
    left.appendChild(sub);

    const right = document.createElement("span");
    right.className = `badge ${priorityBadgeClass(task.priority)}`;
    right.textContent = task.priority;

    row.appendChild(left);
    row.appendChild(right);
    return row;
  }

  function renderTaskCard(task) {
    const wrap = document.createElement("article");
    wrap.className = `task${task.completed ? " is-done" : ""}`;
    wrap.setAttribute("data-task-id", task.id);

    const main = document.createElement("div");
    main.className = "task-main";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const desc = document.createElement("div");
    desc.className = "task-desc";
    desc.textContent = task.description ? task.description : "No description.";

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const badge = document.createElement("span");
    badge.className = `badge ${priorityBadgeClass(task.priority)}`;
    badge.textContent = task.priority;

    const hours = document.createElement("span");
    hours.className = "meta-chip";
    hours.textContent = `${task.estHours}h`;

    meta.appendChild(badge);
    meta.appendChild(hours);

    main.appendChild(title);
    main.appendChild(desc);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.className = `btn btn-small ${task.completed ? "btn-secondary" : "btn-primary"}`;
    completeBtn.type = "button";
    completeBtn.textContent = task.completed ? "Completed" : "Complete";
    completeBtn.setAttribute(
      "aria-label",
      task.completed
        ? `Task completed: ${task.title}`
        : `Mark complete: ${task.title}`,
    );
    completeBtn.addEventListener("click", () => toggleComplete(task.id));

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-small btn-danger";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.setAttribute("aria-label", `Remove task: ${task.title}`);
    removeBtn.addEventListener("click", () => removeTask(task.id));

    actions.appendChild(completeBtn);
    actions.appendChild(removeBtn);

    wrap.appendChild(main);
    wrap.appendChild(actions);
    return wrap;
  }

  // -----------------------------
  // Mutations
  // -----------------------------
  function addTask({ title, description, priority, estHours, scheduledDate }) {
    const task = {
      id: generateId(),
      title,
      description: (description || "").trim(),
      priority,
      estHours,
      completed: false,
      scheduledDate,
      createdAt: Date.now(),
    };

    state.tasks.unshift(task);
    saveTasks(state.tasks);
    renderAll();
  }

  function toggleComplete(taskId) {
    const idx = state.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    state.tasks[idx].completed = !state.tasks[idx].completed;
    saveTasks(state.tasks);
    renderAll();
  }

  function removeTask(taskId) {
    const before = state.tasks.length;
    state.tasks = state.tasks.filter((t) => t.id !== taskId);

    if (state.tasks.length !== before) {
      saveTasks(state.tasks);
      renderAll();
    }
  }

  function nextDay() {
    // Simulate: move incomplete tasks from active day to next day
    const from = state.activeDate;
    const to = addDaysISO(from, 1);

    state.tasks = state.tasks.map((t) => {
      if (t.scheduledDate === from && !t.completed) {
        return { ...t, scheduledDate: to };
      }
      return t;
    });

    state.activeDate = to;
    setActiveDate(to);
    saveTasks(state.tasks);

    // Ensure Add Task date default matches new day
    const dateInput = $("#taskDate");
    if (dateInput) dateInput.value = to;

    showToast("Next day", "Incomplete tasks moved forward (simulated).");
    renderAll();

    // Helpful UX: switch to Today’s Plan after rolling day
    setRoute("today");
  }

  function clearAll() {
    if (!confirm("Clear all tasks? This cannot be undone.")) return;

    state.tasks = [];
    saveTasks(state.tasks);
    showToast("Cleared", "All tasks removed.");
    renderAll();
    setRoute("dashboard");
  }

  // -----------------------------
  // Export / Import
  // -----------------------------
  function exportJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      activeDate: state.activeDate,
      tasks: state.tasks,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-smart-planner-export-${state.activeDate}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  function importJson(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];

        // Basic shape sanitization
        const sanitized = tasks
          .filter((t) => t && typeof t === "object")
          .map((t) => ({
            id: typeof t.id === "string" ? t.id : generateId(),
            title: String(t.title || "Untitled").trim(),
            description: String(t.description || "").trim(),
            priority: ["High", "Medium", "Low"].includes(t.priority)
              ? t.priority
              : "Low",
            estHours: Number.isFinite(Number(t.estHours))
              ? Number(t.estHours)
              : 1,
            completed: !!t.completed,
            scheduledDate:
              typeof t.scheduledDate === "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(t.scheduledDate)
                ? t.scheduledDate
                : state.activeDate,
            createdAt: Number.isFinite(Number(t.createdAt))
              ? Number(t.createdAt)
              : Date.now(),
          }));

        state.tasks = sanitized;
        saveTasks(state.tasks);

        // Optionally adopt imported activeDate if valid
        if (
          typeof parsed.activeDate === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(parsed.activeDate)
        ) {
          state.activeDate = parsed.activeDate;
          setActiveDate(state.activeDate);
        }

        showToast("Imported", "Tasks loaded from JSON.");
        renderAll();
        setRoute("dashboard");
      } catch {
        alert("Invalid JSON file.");
      }
    };

    reader.readAsText(file);
  }

  // -----------------------------
  // Event wiring
  // -----------------------------
  function wireEvents() {
    // Navigation
    $$(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        setRoute(link.dataset.route);
      });
    });

    // Sidebar open/close
    $("#btnSidebar")?.addEventListener("click", openSidebar);
    $("#btnSidebarClose")?.addEventListener("click", closeSidebar);
    $("#overlay")?.addEventListener("click", closeSidebar);

    // Top action
    $("#btnNextDay")?.addEventListener("click", nextDay);

    // Dashboard quick actions
    $("#btnJumpAdd")?.addEventListener("click", () => setRoute("add"));
    $("#btnGoToday")?.addEventListener("click", () => setRoute("today"));

    // Today page quick add
    $("#btnTodayAdd")?.addEventListener("click", () => setRoute("add"));

    // Form
    const form = $("#taskForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = {
        title: $("#taskTitle")?.value,
        description: $("#taskDesc")?.value,
        priority: $("#taskPriority")?.value,
        hours: $("#taskHours")?.value,
        date: $("#taskDate")?.value,
      };

      const v = validateTaskForm(formData);
      if (!v.ok) return;

      addTask({
        title: v.title,
        description: String(formData.description || ""),
        priority: v.priority,
        estHours: v.hours,
        scheduledDate: v.date,
      });

      // Reset fields but keep date aligned
      form.reset();
      $("#taskDate").value = state.activeDate;

      showToast("Task added", "Your AI plan has been updated.");

      // UX: take user to Today’s Plan
      setRoute("today");
    });

    $("#btnResetForm")?.addEventListener("click", () => {
      form?.reset();
      // Keep the date input useful after reset
      const date = $("#taskDate");
      if (date) date.value = state.activeDate;

      // Clear validation messages
      setFieldError("errTitle", "");
      setFieldError("errPriority", "");
      setFieldError("errHours", "");
      setFieldError("errDate", "");
    });

    // Settings: export/import/clear
    $("#btnExport")?.addEventListener("click", exportJson);

    $("#btnImport")?.addEventListener("click", () => {
      $("#importFile")?.click();
    });

    $("#importFile")?.addEventListener("change", (e) => {
      const input = e.target;
      const file = input.files && input.files[0] ? input.files[0] : null;
      importJson(file);
      input.value = "";
    });

    $("#btnClear")?.addEventListener("click", clearAll);

    // Settings: prefs
    $("#toggleMotion")?.addEventListener("change", (e) => {
      state.prefs.reduceMotion = !!e.target.checked;
      savePrefs(state.prefs);
      renderSettings();
    });

    $("#toggleCompact")?.addEventListener("change", (e) => {
      state.prefs.compact = !!e.target.checked;
      savePrefs(state.prefs);
      renderSettings();
    });

    // Hash routing support
    window.addEventListener("hashchange", () => {
      setRoute(routeFromHash());
    });

    // Escape key closes sidebar on mobile
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  function init() {
    // Apply prefs immediately
    document.body.classList.toggle("reduce-motion", state.prefs.reduceMotion);
    document.body.classList.toggle("is-compact", state.prefs.compact);

    // Default active date to today if missing
    if (!localStorage.getItem(STORAGE_DATE_KEY)) {
      setActiveDate(state.activeDate);
    }

    // Set Add Task date default
    const dateInput = $("#taskDate");
    if (dateInput) dateInput.value = state.activeDate;

    wireEvents();

    // Go to route based on hash
    setRoute(routeFromHash());
  }

  init();
})();

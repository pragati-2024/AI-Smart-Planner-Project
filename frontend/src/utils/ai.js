// Simple "AI" logic for scheduling tasks into time blocks.
// Requirements:
// - High priority → Morning
// - Medium priority → Afternoon
// - Low priority → Evening

export const TIME_BLOCKS = /** @type {const} */ ([
  "Morning",
  "Afternoon",
  "Evening",
]);

export function getTimeBlockFromPriority(priority) {
  const normalized = String(priority || "").toLowerCase();

  if (normalized === "high") return "Morning";
  if (normalized === "medium") return "Afternoon";
  return "Evening";
}

export function sortTimeBlocks(a, b) {
  return TIME_BLOCKS.indexOf(a) - TIME_BLOCKS.indexOf(b);
}

export function groupTasksByTimeBlock(tasks) {
  /** @type {Record<string, any[]>} */
  const grouped = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };

  for (const task of tasks) {
    const block = task.timeBlock || getTimeBlockFromPriority(task.priority);
    if (!grouped[block]) grouped[block] = [];
    grouped[block].push(task);
  }

  return grouped;
}

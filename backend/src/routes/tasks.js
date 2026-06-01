import { Router } from "express";
import { Task } from "../models/Task.js";

const router = Router();

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function pickTask(doc) {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    priority: doc.priority,
    estimatedTime: doc.estimatedTime,
    timeBlock: doc.timeBlock,
    completed: Boolean(doc.completed),
    createdAt: Number(doc.createdAt || 0),
    rewardedAt: doc.rewardedAt == null ? null : Number(doc.rewardedAt),
  };
}

router.get("/", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.user?.email);
    const requested = normalizeEmail(req.query.email);
    if (requested && requested !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const tasks = await Task.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(tasks.map(pickTask));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.user?.email);
    const requested = normalizeEmail(req.body?.email);
    if (requested && requested !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const id = String(req.body?.id || "").trim();
    const title = String(req.body?.title || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id" });
    if (!title) return res.status(400).json({ error: "Missing title" });

    const payload = {
      userEmail: email,
      id,
      title,
      description: String(req.body?.description || ""),
      priority: String(req.body?.priority || "Medium"),
      estimatedTime: String(req.body?.estimatedTime || ""),
      timeBlock: String(req.body?.timeBlock || "Morning"),
      completed: Boolean(req.body?.completed),
      createdAt: Number(req.body?.createdAt || Date.now()),
      rewardedAt:
        req.body?.rewardedAt == null ? null : Number(req.body.rewardedAt),
    };

    const created = await Task.create(payload);
    res.status(201).json(pickTask(created));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Task already exists" });
    }
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.user?.email);
    const requested = normalizeEmail(req.body?.email || req.query.email);
    if (requested && requested !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id" });

    const allowed = [
      "title",
      "description",
      "priority",
      "estimatedTime",
      "timeBlock",
      "completed",
      "rewardedAt",
    ];
    const update = {};
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) update[key] = req.body[key];
    }

    if (update.title !== undefined) update.title = String(update.title).trim();
    if (update.description !== undefined)
      update.description = String(update.description);
    if (update.priority !== undefined)
      update.priority = String(update.priority);
    if (update.estimatedTime !== undefined)
      update.estimatedTime = String(update.estimatedTime);
    if (update.timeBlock !== undefined)
      update.timeBlock = String(update.timeBlock);
    if (update.completed !== undefined)
      update.completed = Boolean(update.completed);
    if (update.rewardedAt !== undefined) {
      update.rewardedAt =
        update.rewardedAt == null ? null : Number(update.rewardedAt);
    }

    const doc = await Task.findOneAndUpdate(
      { userEmail: email, id },
      { $set: update },
      { new: true },
    );

    if (!doc) return res.status(404).json({ error: "Task not found" });

    res.json(pickTask(doc));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.user?.email);
    const requested = normalizeEmail(req.query.email || req.body?.email);
    if (requested && requested !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id" });

    const result = await Task.deleteOne({ userEmail: email, id });
    if (!result?.deletedCount)
      return res.status(404).json({ error: "Task not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.user?.email);
    const requested = normalizeEmail(req.query.email || req.body?.email);
    if (requested && requested !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Task.deleteMany({ userEmail: email });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.put("/replace", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.user?.email);
    const requested = normalizeEmail(req.body?.email);
    if (requested && requested !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const tasks = Array.isArray(req.body?.tasks) ? req.body.tasks : null;
    if (!tasks) return res.status(400).json({ error: "Missing tasks" });

    const normalized = tasks
      .filter(Boolean)
      .map((t) => {
        const id = String(t?.id || "").trim();
        const title = String(t?.title || "").trim();
        if (!id || !title) return null;
        return {
          userEmail: email,
          id,
          title,
          description: String(t?.description || ""),
          priority: String(t?.priority || "Medium"),
          estimatedTime: String(t?.estimatedTime || ""),
          timeBlock: String(t?.timeBlock || "Morning"),
          completed: Boolean(t?.completed),
          createdAt: Number(t?.createdAt || Date.now()),
          rewardedAt: t?.rewardedAt == null ? null : Number(t.rewardedAt),
        };
      })
      .filter(Boolean);

    await Task.deleteMany({ userEmail: email });
    if (normalized.length) {
      await Task.insertMany(normalized, { ordered: false });
    }

    const fresh = await Task.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();
    res.json(fresh.map(pickTask));
  } catch (err) {
    next(err);
  }
});

export default router;

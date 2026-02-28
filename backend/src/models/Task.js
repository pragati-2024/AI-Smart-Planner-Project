import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    id: { type: String, required: true },

    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: { type: String, default: "Medium" },
    estimatedTime: { type: String, default: "" },
    timeBlock: { type: String, default: "Morning" },

    completed: { type: Boolean, default: false },
    createdAt: { type: Number, default: () => Date.now() },
    rewardedAt: { type: Number, default: null },
  },
  {
    versionKey: false,
  },
);

TaskSchema.index({ userEmail: 1, id: 1 }, { unique: true });

export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

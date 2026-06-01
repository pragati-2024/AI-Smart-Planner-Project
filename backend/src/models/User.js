import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },

    provider: { type: String, default: "email" },
    googleSub: { type: String, default: null },

    createdAt: { type: Number, default: () => Date.now() },
  },
  {
    versionKey: false,
  },
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

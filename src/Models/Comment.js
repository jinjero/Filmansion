import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  flim: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Flim" },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;

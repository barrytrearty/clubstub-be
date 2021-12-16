import mongoose from "mongoose";

const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

export const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user" },
    comment: { type: String, required: true },
    likes: { default: [], type: [likeSchema] },
  },
  { timestamps: true }
);

export const matchSchema = new Schema({
  time: { type: String, required: true },
  date: { type: String, required: true },
  venue: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  type: {
    type: String,
    default: "Exhibition",
    enum: ["Exhibition", "League", "Championship"],
  },
  entryFee: { type: Number, required: true },
  homeTeam: { type: Schema.Types.ObjectId, ref: "clubs" },
  awayTeam: { type: Schema.Types.ObjectId, ref: "clubs" },
  comments: { default: [], type: [commentSchema] },
  likes: { default: [], type: [likeSchema] },
});

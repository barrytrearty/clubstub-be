import mongoose from "mongoose";

const { Schema } = mongoose;

export const competitionSchema = new Schema({
  description: { type: String, required: true },
  matches: [{ type: Schema.Types.ObjectId, ref: "matches" }],
  image: { type: String },
  // comments: { default: [], type: [commentSchema] },
  // likes: { default: [], type: [likeSchema] },
});

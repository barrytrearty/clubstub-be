import mongoose from "mongoose";

const { Schema } = mongoose;

// const likeSchema = new Schema(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "user" },
//   },
//   { timestamps: true }
// );

// export const commentSchema = new Schema(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "user" },
//     comment: { type: String, required: true },
//     likes: { default: [], type: [likeSchema] },
//   },
//   { timestamps: true }
// );

export const matchSchema = new Schema({
  competition: { type: Schema.Types.ObjectId, ref: "competition" },
  // competition: { type: String, required: true },
  description: { type: String, required: true },
  homeTeam: { type: Schema.Types.ObjectId, ref: "clubs" },
  awayTeam: { type: Schema.Types.ObjectId, ref: "clubs" },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  entryFee: { type: Number, required: true },
  capacity: { type: Number },
  image: { type: String },
  // comments: { default: [], type: [commentSchema] },
  // likes: { default: [], type: [likeSchema] },
});

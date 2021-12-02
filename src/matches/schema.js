import mongoose from "mongoose";

const { Schema } = mongoose;

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
});

import mongoose from "mongoose";

const { Schema } = mongoose;

export const countySchema = new Schema({
  name: { type: String, required: true },
  clubs: [{ type: Schema.Types.ObjectId, ref: "clubs" }],
  province: {
    type: String,
    enum: ["Ulster", "Leinster", "Connacht", "Munster"],
  },
  crest: { type: String, required: true },
});

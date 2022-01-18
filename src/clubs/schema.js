import mongoose from "mongoose";

const { Schema } = mongoose;

export const clubSchema = new Schema({
  name: { type: String, required: true },
  province: {
    type: String,
    enum: ["Ulster", "Leinster", "Connacht", "Munster"],
  },
  county: { type: String, required: true },

  crest: { type: String },
  // followers: [{ type: Schema.Types.ObjectId, ref: "users" }],
  // admins: [{ type: Schema.Types.ObjectId, ref: "users" }],
});

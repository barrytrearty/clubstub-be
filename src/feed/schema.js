import mongoose from "mongoose";

const { Schema } = mongoose;

export const feedSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user" },
  clubs: [{ type: Schema.Types.ObjectId, ref: "clubs" }],
  typeOfItem: {
    type: String,
    enum: ["New fixture", "Attending"],
  },
});

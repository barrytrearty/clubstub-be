import mongoose from "mongoose";

const { Schema } = mongoose;

export const countySchema = new Schema({
  name: { type: String, required: true },
  clubs: [{ type: Schema.Types.ObjectId, ref: "clubs" }],
  crest: { type: String, required: true },
  followers: [{ type: Schema.Types.ObjectId, ref: "users" }],
  admins: [{ type: Schema.Types.ObjectId, ref: "users" }],
  // website:{ type: String, required: true },
  // twitter: { type: String, required: true },
  // facebook: { type: String, required: true },
});

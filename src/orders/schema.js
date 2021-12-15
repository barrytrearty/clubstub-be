import mongoose from "mongoose";

const { Schema } = mongoose;

export const orderSchema = new Schema({
  numberOfTickets: { type: Number, required: true },
  match: { type: Schema.Types.ObjectId, ref: "matches" },
  user: { type: Schema.Types.ObjectId, ref: "users" },
});

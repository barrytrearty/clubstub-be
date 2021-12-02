import mongoose from "mongoose";
import { matchSchema } from "./schema.js";

const { model } = mongoose;

export const matchModel = model("matches", matchSchema);

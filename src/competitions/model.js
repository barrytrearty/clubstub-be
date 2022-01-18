import mongoose from "mongoose";
import { competitionSchema } from "./schema.js";

const { model } = mongoose;

export const competitionModel = model("competition", competitionSchema);

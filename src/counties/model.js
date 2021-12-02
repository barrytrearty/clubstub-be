import mongoose from "mongoose";
import { countySchema } from "./schema.js";

const { model } = mongoose;

export const countyModel = model("counties", countySchema);

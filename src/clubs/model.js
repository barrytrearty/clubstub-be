import mongoose from "mongoose";
import { clubSchema } from "./schema.js";

const { model } = mongoose;

export const clubModel = model("clubs", clubSchema);

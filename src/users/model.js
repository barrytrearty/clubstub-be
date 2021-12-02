import mongoose from "mongoose";
import { UserSchema } from "./schema.js";

const { model } = mongoose;

export const UserModel = model("users", UserSchema);

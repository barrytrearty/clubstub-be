import mongoose from "mongoose";
import { orderSchema } from "./schema.js";

const { model } = mongoose;

export const orderModel = model("orders", orderSchema);

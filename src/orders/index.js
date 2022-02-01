import express from "express";
import createHttpError from "http-errors";

import { orderModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";
import { UserModel } from "../users/model.js";

const orderRouter = express.Router();

orderRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const Order = await orderModel.find().populate("match").populate("user");
    res.send(Order);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    if (user) {
      const userOrders = await orderModel
        .find({ user: userId })
        .populate("match")
        .populate("user");
      if (userOrders) {
        res.send(userOrders);
      } else {
        next(createHttpError(404, `Order with id ${id} not found!`));
      }
    }
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/:userId/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    if (user) {
      const id = req.params.id;
      const Order = await orderModel
        .findById(id)
        .populate("match")
        .populate("user");
      if (Order) {
        res.send(Order);
      } else {
        next(createHttpError(404, `Order with id ${id} not found!`));
      }
    }
  } catch (error) {
    next(error);
  }
});

orderRouter.post(
  "/",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      console.log(req.user._id.toString());
      const newOrder = new orderModel({
        ...req.body,
        user: [req.user._id.toString()],
      });
      const { _id } = await newOrder.save(); // this is where the interaction with the db/collection happens

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.put(
  "/:_id",
  JWTAuthMiddleware,
  //   clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;
      const modifiedOrder = await orderModel.findByIdAndUpdate(id, req.body, {
        new: true, // returns the modified user
      });

      if (modifiedOrder) {
        res.send(modifiedOrder);
      } else {
        next(createHttpError(404, `Order with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.delete(
  "/:_id",
  JWTAuthMiddleware,
  //   clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;

      const deletedOrder = await orderModel.findByIdAndDelete(id);

      if (deletedOrder) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `Order with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.delete(
  "/allMatchOrders/:_id",
  JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;

      const deletedOrders = await orderModel.deleteMany({ match: id });

      if (deletedOrders) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `Order with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default orderRouter;

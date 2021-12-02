import express from "express";
import createHttpError from "http-errors";

import { matchModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";

const matchRouter = express.Router();

matchRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const match = await matchModel
      .find()
      .populate("homeTeam")
      .populate("awayTeam");
    res.send(match);
  } catch (error) {
    next(error);
  }
});

matchRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id;
    const match = await matchModel
      .findById(id)
      .populate("homeTeam")
      .populate("awayTeam");
    if (match) {
      res.send(match);
    } else {
      next(createHttpError(404, `Match with id ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

matchRouter.post(
  "/",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      console.log(req.user._id.toString());
      const newMatch = new matchModel({
        ...req.body,
        host: [req.user._id.toString()],
      });
      const { _id } = await newMatch.save(); // this is where the interaction with the db/collection happens

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

matchRouter.put(
  "/:_id",
  JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;
      const modifiedMatch = await matchModel.findByIdAndUpdate(id, req.body, {
        new: true, // returns the modified user
      });

      if (modifiedMatch) {
        res.send(modifiedMatch);
      } else {
        next(createHttpError(404, `Match with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

matchRouter.delete(
  "/:_id",
  JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;

      const deletedMatch = await matchModel.findByIdAndDelete(id);

      if (deletedMatch) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `Match with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default matchRouter;

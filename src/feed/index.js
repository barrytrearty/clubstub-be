import express from "express";
import createHttpError from "http-errors";

import { feedModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";

const feedRouter = express.Router();

feedRouter.get(
  "/",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const feed = await feedModel
        .find()
        .populate("homeTeam")
        .populate("awayTeam");
      res.send(feed);
    } catch (error) {
      next(error);
    }
  }
);

feedRouter.post(
  "/match",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      // console.log(req.user._id.toString());
      const newFeed = new feedModel({
        ...req.body,
        host: [req.user._id.toString()],
      });
      const { _id } = await newFeed.save(); // this is where the interaction with the db/collection happens
      const addToCountyArray = await countyModel.findOneAndUpdate(
        {
          name: req.body.county,
        },
        { $push: { feeds: _id } },
        { returnNewDocument: true }
      );

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

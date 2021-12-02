import express from "express";
import createHttpError from "http-errors";

import { countyModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";
import { clubModel } from "../clubs/model.js";

const countyRouter = express.Router();

countyRouter.get(
  "/",
  //  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const county = await countyModel.find();
      res.send(county);
    } catch (error) {
      next(error);
    }
  }
);

countyRouter.get(
  "/:name",
  //  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const countyName = req.params.name;
      const county = await countyModel
        .findOne({ name: countyName })
        .populate("clubs")
        .populate("followers");
      if (county) {
        res.send(county);
      } else {
        next(createHttpError(404, `county with name ${countyName} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

countyRouter.get(
  "/:name/clubs",
  //  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const countyName = req.params.name;
      const county = await countyModel.findOne({ name: countyName });
      if (county) {
        const clubs = await clubModel.find({ county: countyName });
        res.status(200).send(clubs);
      } else {
        next(createHttpError(404, `county with name ${countyName} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

countyRouter.post(
  "/",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      // console.log(req.user._id.toString());
      const newCounty = new countyModel({
        ...req.body,
        host: [req.user._id.toString()],
      });
      const { _id } = await newCounty.save(); // this is where the interaction with the db/collection happens

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

countyRouter.put(
  "/:_id",
  // JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;
      const modifiedCounty = await countyModel.findByIdAndUpdate(id, req.body, {
        new: true, // returns the modified user
      });

      if (modifiedCounty) {
        res.send(modifiedCounty);
      } else {
        next(createHttpError(404, `County with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

countyRouter.put("/:name/follow", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const countyName = req.params.name;
    const modifiedCounty = await countyModel.findOneAndUpdate(
      { name: countyName },
      { $push: { followers: req.body.id } },
      {
        new: true, // returns the modified user
      }
    );
    if (modifiedCounty) {
      res.send(modifiedCounty);
    } else {
      next(createHttpError(404, `County with id ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

countyRouter.delete(
  "/:_id",
  JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;

      const deletedCounty = await countyModel.findByIdAndDelete(id);

      if (deletedCounty) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `County with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default countyRouter;

import express from "express";
import createHttpError from "http-errors";

import { clubModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";
import { countyModel } from "../counties/model.js";

const clubRouter = express.Router();

clubRouter.get(
  "/",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const club = await clubModel.find();
      res.send(club);
    } catch (error) {
      next(error);
    }
  }
);

//Get clubs from a single county
clubRouter.get(
  "/county/:county",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const county = req.params.county;
      const club = await clubModel.find({ county: county });
      if (club) {
        res.send(club);
      } else {
        next(createHttpError(404, `Club with id ${county} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

clubRouter.get(
  "/:id",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const club = await clubModel.findById(id).populate("followers");
      if (club) {
        res.send(club);
      } else {
        next(createHttpError(404, `Club with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

clubRouter.post(
  "/",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      // console.log(req.user._id.toString());
      const newClub = new clubModel({
        ...req.body,
        host: [req.user._id.toString()],
      });
      const { _id } = await newClub.save(); // this is where the interaction with the db/collection happens
      const addToCountyArray = await countyModel.findOneAndUpdate(
        {
          name: req.body.county,
        },
        { $push: { clubs: _id } },
        { returnNewDocument: true }
      );

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

clubRouter.put(
  "/:_id",
  // JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;
      const modifiedClub = await clubModel.findByIdAndUpdate(id, req.body, {
        new: true, // returns the modified user
      });

      if (modifiedClub) {
        res.send(modifiedClub);
      } else {
        next(createHttpError(404, `Club with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

clubRouter.put("/:id/follow", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id;
    const modifiedClub = await clubModel.findOneAndUpdate(
      { _id: id },
      { $push: { followers: req.body.id } },
      {
        new: true, // returns the modified user
      }
    );
    if (modifiedClub) {
      res.send(modifiedClub);
    } else {
      next(createHttpError(404, `Club with id ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

clubRouter.delete(
  "/:_id",
  JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;

      const deletedClub = await clubModel.findByIdAndDelete(id);

      if (deletedClub) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `Club with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default clubRouter;

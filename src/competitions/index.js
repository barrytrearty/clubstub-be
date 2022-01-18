import express from "express";
import createHttpError from "http-errors";

import { competitionModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "linked-products",
  },
});

const competitionRouter = express.Router();

competitionRouter.get(
  "/",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const competitions = await competitionModel.find().populate("matches");
      res.send(competitions);
    } catch (error) {
      next(error);
    }
  }
);

competitionRouter.get(
  "/:id",
  //  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const Competition = await competitionModel
        .findById(id)
        .populate("homeTeam")
        .populate("awayTeam");
      if (Competition) {
        res.send(Competition);
      } else {
        next(createHttpError(404, `Competition with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

competitionRouter.post(
  "/",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      console.log(req.user._id.toString());
      const newCompetition = new competitionModel({
        ...req.body,
        host: [req.user._id.toString()],
      });
      const { _id } = await newCompetition.save(); // this is where the interaction with the db/collection happens

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

competitionRouter.post(
  "/:id/imageUpload",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  multer({ storage: cloudinaryStorage }).single("avatar"),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const modifiedPost = await competitionModel.findByIdAndUpdate(
        id,
        { image: req.file.path },
        {
          new: true,
        }
      );
      res.send(modifiedPost);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

competitionRouter.put(
  "/:_id",
  // JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;
      const modifiedCompetition = await competitionModel.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true, // returns the modified user
        }
      );

      if (modifiedCompetition) {
        res.send(modifiedCompetition);
      } else {
        next(createHttpError(404, `Competition with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

competitionRouter.delete(
  "/:_id",
  JWTAuthMiddleware,
  clubAdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params._id;

      const deletedCompetition = await competitionModel.findByIdAndDelete(id);

      if (deletedCompetition) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `Competition with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default competitionRouter;

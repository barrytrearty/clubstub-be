import express from "express";
import createHttpError from "http-errors";

import { matchModel } from "./model.js";
import { orderModel } from "../orders/model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";

// import { getPdfReadableStream } from "./pdf.js";
import { pipeline } from "stream";
import { sendEmail } from "./sendEmail.js";
import { v4 as uuid } from "uuid";

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { generatePDFAsync } from "./pdf1.js";

import QRCode from "qrcode";
import Stripe from "stripe";
import fs from "fs-extra";

const { unlink } = fs;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

const matchRouter = express.Router();

matchRouter.get(
  "/",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const match = await matchModel
        .find()
        .populate("competition")
        .populate("homeTeam")
        .populate("awayTeam")
        .populate("admin");
      res.send(match);
    } catch (error) {
      next(error);
    }
  }
);

matchRouter.get("/search/:searchQuery", async (req, res, next) => {
  try {
    const matches = await matchModel
      .find()
      .populate("competition")
      .populate("homeTeam")
      .populate("awayTeam")
      .populate("admin");
    const matchSearch = matches.filter(
      (m) =>
        m.awayTeam.name.toLowerCase().includes(req.params.searchQuery) ||
        m.homeTeam.name.toLowerCase().includes(req.params.searchQuery)
    );
    console.log(req.params.searchQuery);
    res.send(matchSearch);
  } catch (error) {
    next(error);
  }
});

// matchRouter.get(
//   "/competition/:compName",
//   //  JWTAuthMiddleware,
//   async (req, res, next) => {
//     try {
//       const compName = req.params.compName;
//       const match = await matchModel
//         .find({ type: compName })
//         .populate("homeTeam")
//         .populate("awayTeam");
//       if (match) {
//         res.send(match);
//       } else {
//         next(createHttpError(404, `Match with id ${compName} not found!`));
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );
matchRouter.get(
  "/upNext",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const match = await matchModel
        .find({})
        .sort({ date: 1 })
        .populate("competition")
        .populate("homeTeam")
        .populate("awayTeam");
      // .populate("admin");
      res.send(match);
    } catch (error) {
      next(error);
    }
  }
);

matchRouter.get(
  "/value",
  // JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const match = await matchModel
        .find({})
        .sort({ entryFee: 1 })
        .populate("competition")
        .populate("homeTeam")
        .populate("awayTeam");
      // .populate("admin");
      res.send(match);
    } catch (error) {
      next(error);
    }
  }
);

matchRouter.get("/admin/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id;
    const match = await matchModel
      .find({ admin: id })
      .populate("competition")
      .populate("homeTeam")
      .populate("awayTeam");
    // .populate("admin");
    if (match) {
      res.send(match);
    } else {
      next(createHttpError(404, `Match with id ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

matchRouter.get(
  "/:id",
  //  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const match = await matchModel
        .findById(id)
        .populate("competition")
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
  }
);

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

matchRouter.post(
  "/:id/imageUpload",
  JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
  multer({ storage: cloudinaryStorage }).single("avatar"),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const modifiedPost = await matchModel.findByIdAndUpdate(
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

matchRouter.put(
  "/:_id",
  // JWTAuthMiddleware,
  // clubAdminOnlyMiddleware,
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
      const deletedOrders = await orderModel.deleteMany({
        match: { _id: id },
      });

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

matchRouter.post(
  "/checkout",
  //  JWTAuthMiddleware,
  async (req, res) => {
    // console.log("Request:", req.body);

    let error;
    let status;
    let qrCodeImg;
    try {
      const { matchObj, token } = req.body;

      const customer = await stripe.customers.create({
        email: token.email,
        source: token.id,
      });
      const idempotencyKey = uuid();
      // const idempotency_key = uuid();
      const charge = await stripe.charges.create(
        {
          amount: matchObj.entryFee * 10,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `Purchased the ${matchObj.competition.description} tickets`,
          shipping: {
            name: token.card.name,
            address: {
              line1: token.card.address_line1,
              line2: token.card.address_line2,
              city: token.card.address_city,
              country: token.card.address_country,
              postal_code: token.card.address_zip,
            },
          },
        },
        {
          // idempotency_key,
          idempotencyKey,
        }
      );
      // console.log("Charge:", { charge });
      // console.log(matchObj);
      status = "success";
    } catch (error) {
      console.error("Error:", error);
      status = "failure";
    }

    res.json({ error, status });
  }
);

matchRouter.post(
  "/qrCode",
  //  JWTAuthMiddleware,
  async (req, res) => {
    const { matchObj, receiverEmail } = req.body;
    try {
      const source = await generatePDFAsync(matchObj);
      console.log("SOURCE ", source);
      await sendEmail(matchObj, receiverEmail, source);
      await unlink(source);
      res.send("Sent");
    } catch (error) {
      console.error("Error:", error);
    }
  }
);

export default matchRouter;

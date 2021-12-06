import express from "express";
import createHttpError from "http-errors";

import { matchModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";
import { sendEmail } from "./sendEmail.js";
import { v4 as uuid } from "uuid";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

matchRouter.post(
  "/checkout",
  //  JWTAuthMiddleware,
  async (req, res) => {
    console.log("Request:", req.body);

    let error;
    let status;
    try {
      const { product, token } = req.body;

      const customer = await stripe.customers.create({
        email: token.email,
        source: token.id,
      });
      const idempotencyKey = uuid();
      // const idempotency_key = uuid();
      const charge = await stripe.charges.create(
        {
          amount: product.price * 10,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `Purchased the ${product.name}`,
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
      console.log("Charge:", { charge });
      const content = "You are going to the game";
      await sendEmail(content, token.email);
      status = "success";
    } catch (error) {
      console.error("Error:", error);
      status = "failure";
    }

    res.json({ error, status });
  }
);

// matchRouter.post("sendTicket", async (req, res, next) => {
//   try {
//     const { email } = req.body;
//   } catch (error) {}
// });

export default matchRouter;

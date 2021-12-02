import express from "express";
import createHttpError from "http-errors";

import { UserModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";
import { verifyRefreshAndGenerateTokens } from "../auth/tools.js";

import passport from "passport";
import GoogleStrategy from "../auth/oauth.js";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    const tokens = await JWTAuthenticate(newUser);
    res.send({ ...newUser.toObject(), tokens });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      const tokens = await JWTAuthenticate(user);

      res.send({ tokens });
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }

    // if (user) {
    //   const { accessToken, refreshToken } = await JWTAuthenticate(user);

    //   res.cookie("accessToken", accessToken, {
    //     httpOnly: false,
    //     // secure: (process.env.NODE_ENV = "production" ? true : false),
    //     // sameSite: "none",
    //   });
    //   res.cookie("refreshToken", refreshToken, {
    //     httpOnly: false,
    //     // secure: (process.env.NODE_ENV = "production" ? true : false),
    //     // sameSite: "none",
    //   });
    //   // res.send()
    //   res.send(accessToken); //Sending access token just to to enable postman log in
    // } else {
    //   next(createHttpError(401, "Credentials are not ok!"));
    // }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { currentRefreshToken } = req.body;

    const { accessToken, refreshToken } = await verifyRefreshAndGenerateTokens(
      currentRefreshToken
    );
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/logout", JWTAuthMiddleware, async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.send();
  } catch (error) {
    next(error);
  }
});

// usersRouter.get(
//   "/me/accomodation",
//   JWTAuthMiddleware,
//   hostOnlyMiddleware,
//   async (req, res, next) => {
//     try {
//       console.log(req.user._id.toString());
//       const accomodations = await AccomodationSchema.find({
//         host: req.user._id.toString(),
//       });

//       res.status(200).send(accomodations);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      console.log(req.user);

      res.cookie("accessToken", req.user.tokens.accessToken, {
        httpOnly: true,
        // secure: (process.env.NODE_ENV = "production" ? true : false),
        sameSite: "none",
      });
      res.cookie("refreshToken", req.user.tokens.refreshToken, {
        httpOnly: true,
        // secure: (process.env.NODE_ENV = "production" ? true : false),
        sameSite: "none",
      });
      res.redirect(`http://localhost:3000`);
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
import express from "express";
import createHttpError from "http-errors";

import { UserModel } from "./model.js";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/token.js";
import { clubAdminOnlyMiddleware } from "../auth/adminOnly.js";
import { verifyRefreshAndGenerateTokens } from "../auth/tools.js";

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

import passport from "passport";
import GoogleStrategy from "../auth/oauth.js";

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
    const newUser = new UserModel({
      ...req.body,
      picture:
        "https://res.cloudinary.com/btrearty/image/upload/v1639568256/avatar/user_oseevk.png",
    });
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

usersRouter.post(
  "/me/picture",
  JWTAuthMiddleware,
  multer({ storage: cloudinaryStorage }).single("avatar"),
  async (req, res, next) => {
    try {
      // const user = await UserModel.findById(req.user._id);
      req.user.picture = req.file.path;
      await req.user.save();
      // const newAvatar = { cover: req.file.path };
      // const userWithAvatar = { ...user, ...newAvatar };
      res.send(req.user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

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
  "/:id",
  //  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await UserModel.findById(id);
      // .populate("homeTeam")
      // .populate("awayTeam");
      if (user) {
        res.send(user);
      } else {
        next(createHttpError(404, `User with id ${id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

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
      res.redirect(`https://clubstub-fe.vercel.app`);
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;

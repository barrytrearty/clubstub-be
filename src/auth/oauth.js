import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { UserModel } from "../users/model.js";
import { JWTAuthenticate } from "./tools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL}/users/googleRedirect`,
  },
  async (accessToken, refreshToken, googleProfile, passportNext) => {
    try {
      console.log(googleProfile);

      const user = await UserModel.findOne({ googleId: googleProfile.id });

      if (user) {
        const tokens = await JWTAuthenticate(user);
        passportNext(null, { tokens });
      } else {
        const newUser = {
          username: googleProfile.emails[0].value,
          email: googleProfile.emails[0].value,
          googleId: googleProfile.id,
          role: "User",
        };

        const createdUser = new UserModel(newUser);
        const savedUser = await createdUser.save();

        const tokens = await JWTAuthenticate(savedUser);

        passportNext(null, { tokens });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

passport.serializeUser(function (data, passportNext) {
  passportNext(null, data);
});

export default googleStrategy;

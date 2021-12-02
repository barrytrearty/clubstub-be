import jwt from "jsonwebtoken";
import { UserModel } from "../users/model.js";

export const JWTAuthenticate = async (user) => {
  const accessToken = await generateJWT({ _id: user._id });
  const refreshToken = await generateRefreshJWT({ _id: user._id });

  // user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const generateJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) rej(err);
      else res(decodedToken);
    })
  );

const generateRefreshJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

const verifyRefreshJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
      if (err) rej(err);
      else res(decodedToken);
    })
  );

export const verifyRefreshAndGenerateTokens = async (actualRefreshToken) => {
  const decodedRefreshToken = await verifyRefreshJWT(actualRefreshToken);

  const user = await UserModel.findById(decodedRefreshToken._id);

  if (!user) throw createHttpError(404, "User not found");

  if (user.refreshToken && user.refreshToken === actualRefreshToken) {
    const { accessToken, refreshToken } = await JWTAuthenticate(user);

    return { accessToken, refreshToken };
  } else throw createHttpError(401, "Refresh token not valid!");
};

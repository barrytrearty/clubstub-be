import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

export const UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String },
  username: { type: String },
  picture: { type: String },
  role: { type: String, default: "User", enum: ["User", "Admin"] },
  refreshToken: { type: String },
  googleId: { type: String },
  county: { type: Schema.Types.ObjectId, ref: "counties" },
  followers: [{ type: Schema.Types.ObjectId, ref: "users" }],
  following: [{ type: Schema.Types.ObjectId, ref: "users" }],
});

UserSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPW = newUser.password;

  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.__v;
  delete userObject.refreshToken;
  delete userObject.googleId;

  return userObject;
};

UserSchema.statics.checkCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);

    if (isMatch) return user;
    else return null;
  } else return null;
};

// export default model("users", UserSchema);

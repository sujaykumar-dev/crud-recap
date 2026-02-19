import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },

    fullName: {
      type: String,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user","admin"],
      required:true,
      default:"user"
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
    },
    isDeleted:{
      type: Boolean,
      default:false,
      index:true
    },
    deletedAt:{
      type:Date
    }
  },{ timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return //next();

  this.password = await bcrypt.hash(this.password, 10);
  //next();
});
userSchema.pre(/^find/,function(){
  if(!this.getOptions().includeDeleted){
    this.where({isDeleted:false});
  }
})
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,  
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);

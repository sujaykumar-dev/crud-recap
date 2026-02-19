import { configDotenv } from "dotenv";
import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { paginate } from "../utils/pagination.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error while generating Access and refresh token! ", error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(401, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  }).setOptions({includeDeleted:true});

  if (existedUser && !existedUser.isDeleted) {
    throw new ApiError(401, "User Already Exists!");
  }

  if(existedUser && existedUser.isDeleted ){
    existedUser.isDeleted=false;
    existedUser.deletedAt=null;
    existedUser.password=password;
    existedUser.username=username.toLowerCase();
    existedUser.fullName=fullName;
    existedUser.email=email;

    await existedUser.save({validateBeforeSave:true});
    const restoredUser = await User.findById(existedUser._id).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200,restoredUser,"User restored successfully!"))
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(401, "Error creating User!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Registered Succcessfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(401, "Username or Email is required!");
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (!existingUser) {
    throw new ApiError(404, "User not found!");
  }
  const isPasswordCorrect = await existingUser.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id
  );

  const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged in Successfully"
      )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200,req.user,"User fetched Succesfully"))
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const {fullName,email}=req.body
  if(!fullName && !email){
    throw new ApiError(401,"At least one field is required to update details")
  }
  const user =await User.findByIdAndUpdate(
    req.user?._id,
    {$set:{fullName,email:email}}
  ).select("-password")

  return res.status(200).json(new ApiResponse(20,user,"Account Details updated sucessfully"))
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{refreshToken:undefined}
    },
    {new:true}
  )

  const options={
    httpOnly:true,
    secure:true
  }

  res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged out successfully"))
});

const updatePassword = asyncHandler(async (req, res) => {

  const {oldPassword,newPassword}=req.body || req.params;
  if(!newPassword || !oldPassword){
    throw new ApiError(401,"Both passwords are Required!")
  }
  const user = await User.findById(req.user?._id)

  const isPasswordvalid= await user.comparePassword(oldPassword)
  if(!isPasswordvalid){
    throw new ApiError(401,"Invalid Password!")
  }

  if(oldPassword===newPassword){
    throw new ApiError(401,"Password cannot be the same as previous one!")
  }
  user.password=newPassword
  // user.markModified("Password")

  await user.save({validateBeforeSave:true})

  res.status(200).json(new ApiResponse(200,{},"Password Changed Succcesfully"))
});

const refreshAccesstoken = asyncHandler(async (req, res) => {
  const incomingRefershToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefershToken){
    throw new ApiError(401,"Unauthorized Request!")
  }
  try {
    const decodedToken = await jwt.verify(incomingRefershToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id) 
    if(!user){
      throw new ApiError(401,"Invalid refresh Token")
    }
    if(incomingRefershToken !== user?.refreshToken){
      throw new ApiError(401,"refersh token is expired or used")
    }
    
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    
    const options ={
      httpOnly:true,
      secure:true
    }
    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(new ApiResponse(200,{accessToken,newRefreshToken},"Access Token Refreshed successfully"))

  } catch (error) {
      throw new ApiError(401,error?.message|| "Invlid Access Token")
  }
});


//admin routes
const updateUserRole=newRole=>asyncHandler(async(req,res)=>{
  const {id}= req.params
  if(!id){
    throw new ApiError(400,"User ID is required")
  }

  if(id === req.user._id){
    throw new ApiError(400,"You cannot modify your own role!")
  }

  const user = await User.findOneAndUpdate(
    {_id:id, role:{$ne:newRole}},
    {role:newRole},
    {new:true}
  )
  if(!user){
    throw new ApiError(409,`User is already ${newRole} or Not Found! `)
  }
  const updatedUser= await User.findById(id).select("-password -refreshToken")

  return res.status(201).json(new ApiResponse(201,updatedUser,"User role Updated Successfully"))
})

const getAllUsers=asyncHandler(async(req,res)=>{
  const users= await paginate(
    User,
    {},
    req.query,
    {includeDeleted:true}
  )
  return res.status(200).json(new ApiResponse(200,users,"All users are fetched Successfully"))
})
const getUserByID= asyncHandler(async(req,res)=>{
  const {id}= req.params
  if(!id){
     throw new ApiError(401,"User ID required")
  }
  const user=await User.findById(id).setOptions({includeDeleted:true}).select("-password -refreshToken")
  return res.status(201).json(new ApiResponse(201,user,"User fetched  succesfully"))
})
const deleteUser=asyncHandler(async(req,res)=>{
  const {id} = req.params

  if(!id){
    throw new ApiError(401,"User Id is required")
  }

  const user = await User.findById(id)

  if(!user){
    throw new ApiError(404,"User Not Found!")
  }
  if(user.isDeleted){
    throw new ApiError(400,"User Already Deleted!")
  }

  if(user.role ==="admin"){
    const adminCount= await User.countDocuments({role:"admin",isDeleted:false})
    if(adminCount===1){
      throw new ApiError(400,"Cannot delete the last remaining admin")
    }
  }

  user.isDeleted=true;
  user.deletedAt= new Date();
  user.refreshToken=undefined;    
  await user.save();
  return res.status(200).json(new ApiResponse(200,{},"User soft-deleted Successfully"))
})

const restore=asyncHandler(async(req,res)=>{
  const {id}=req.params
  const user=await User.findById(id).setOptions({includeDeleted:true})
  if(!user){
    throw new ApiError(404,"No users found!")
  }

  if(!user.isDeleted){
    throw new ApiError(400,"User is Not Deleted or Already restored")
  }
  user.isDeleted=false;
  user.deletedAt=null;
  await user.save()

  const restoredUser= await user.findById(id).select("-password -refreshToken")

  if(!restoredUser){
    throw new ApiError(500,"Error restoring user")
  }

  return res.status(200).json(new ApiResponse(200,restoredUser,"User restored Successfully"))


})
export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updatePassword,
  updateUserDetails,
  refreshAccesstoken,
  getAllUsers,
  deleteUser,
  updateUserRole,
  restore,
  getUserByID
};

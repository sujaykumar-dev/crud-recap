import { Router } from "express";
import { getUserProfile, loginUser, logoutUser, refreshAccesstoken, registerUser, updatePassword, updateUserDetails } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


//routes :
// register , login, logout, updateDetails, userInfo, updatePassword, refreshAccesstoken
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-access-token").post(refreshAccesstoken)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/update-password").post(verifyJWT,updatePassword)
router.route("/get-user-profile").get(verifyJWT,getUserProfile)
router.route("/update-details").patch(verifyJWT,updateUserDetails)

export default router
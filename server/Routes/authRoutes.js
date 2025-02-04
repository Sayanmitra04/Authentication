import express from "express";
import { isAuthenticated, register } from "../controllers/authcontroller.js";
import { login } from "../controllers/authcontroller.js"; // Adjust the path as needed
import { logout } from "../controllers/authcontroller.js"; // Adjust the path as needed
import userAuth from "../middleware/userAuth.js";
import { sendverifyOtp } from "../controllers/authcontroller.js"; // Adjust the path as needed
import { verifyEmail } from "../controllers/authcontroller.js"; // Adjust the path as needed
import { sendResetOtp } from "../controllers/authcontroller.js"; // Adjust the path as needed
import { resetPassword } from "../controllers/authcontroller.js"; // Adjust the path as needed

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/send-verify-otp", userAuth,sendverifyOtp);

authRouter.post("/verify-account", userAuth,verifyEmail);

authRouter.get("/is-auth", userAuth,isAuthenticated);

authRouter.post("/send-reset-otp", sendResetOtp);

authRouter.post("/reset-password", resetPassword);

export default authRouter;

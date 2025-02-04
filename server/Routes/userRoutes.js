import express from "express";
import { getUserdata } from "../controllers/userController.js";
import userAuth from "../middleware/userAuth.js";




const userRouter = express.Router();

userRouter.get("/data",userAuth,getUserdata);

export default userRouter;
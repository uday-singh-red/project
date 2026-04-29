import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router= Router();

router.route("/register").post(
     (req, res, next) => {
    console.log("➡️ request aayi");
    next();
  },
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    (req, res, next) => {
    console.log("➡️ multer ke baad");
    next();
  },
    registerUser
  )

export {router};
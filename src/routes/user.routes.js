import { Router } from "express";
import { loginUser, logOut, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

  router.route("/login").post(loginUser)

  router.route("/logout").post(verifyJWT,logOut)

  router.route("/refresh-token").post(refreshAccessToken)
export {router};
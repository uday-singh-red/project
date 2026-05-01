import  jwt   from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asynHandler(async (req, res, next) => {

   console.log("cookies:", req.cookies);
console.log("auth:", req.headers.authorization);
   try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer ', '')

      if (!token) {
         throw new ApiError(401, "Unauthorized: Token missing")
      }

      const decoded = jwt .verify(token, process.env.ACCESS_TOKEN_SECRET)

      const user = await User.findById(decoded._id).select("-password -refreshToken")

      if (!user) {
         throw new ApiError(400, "Unauthorized: User not found")
      }

      req.user = user

      next()
   } catch (error) {
      throw new ApiError(401, error?.message || "invalid token")
   }
})
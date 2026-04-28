import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Response } from "../utils/response.js";

const registerUser= asynHandler( async(req, res)=>{
   
   const {fullname , email, username, password } =req.body;

   console.log(req.body)

     if ([username,email,fullname,password].some((field)=>field?.trim()===""))
         {
         throw new ApiError(400,"all field should be complete")
        }

        const existingUser=await User.findOne(
           {
            $or:[{email}, {username}]
           }
        )

        if(existingUser){
            throw new ApiError(409,"user is already registerd")
        }
        console.log(existingUser)

       const avatarLocalPath= req.files?.avatar[0]?.path;
       const coverImageLocalPath= req.files?.coverImage[0]?.path;

       if (!avatarLocalPath) {
        throw new ApiError(400," avatar is mendatory ")
       }

       const avatar= await uploadOnCloudinary(avatarLocalPath)
       const coverImage= await uploadOnCloudinary(coverImageLocalPath)

       if (!avatar) {
         throw new ApiError(400," avatar is not uploaded ")
       }

     const user = await User.create({
                fullname,
                username: username.toLowerCase(),
                email,
                avatar: avatar.url,
                coverimage: coverImage?.url || ""
            })

     const createUser=await User.findById(user._id).select("-password -referstoken")

     if(!createUser){
        throw new ApiError(500, "something went wrong during registration")
     }
    
    return res.status(201).json(
        new Response(200,createUser,"user registered successflly")
     )


})

export {registerUser}
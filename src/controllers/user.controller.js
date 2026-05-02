import { jwt } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asyncHandler.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { Response } from "../utils/response.js";

const option={
      httpOnly:true,
      secure:true
  }

const generateRefreshAndAccessToken=async(userId)=>{
   try {
     const user= await User.findById(userId)
     const accessToken=user.generateAccessToken();
     const refreshToken=user.generateRefreshToken();

     user.refreshToken=refreshToken;
     await user.save({validateBeforeSave:false})

     return {accessToken,refreshToken}


   } catch (error) {
      throw new ApiError(500,"spmethin went wrong while generating token")
   }
}

const registerUser= asynHandler( async(req, res)=>{
   
   const {fullname , email, username, password } = req.body|| {};

  console.log("CONTENT-TYPE:", req.headers["content-type"]);
console.log("BODY:", req.body);
console.log("FILES:", req.files);

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

     const avatarLocalPath = req.files?.avatar?.[0]?.path;
     const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
     
       if (!avatarLocalPath) {
        throw new ApiError(400," avatar is mendatory ")
       }

       const avatar= await uploadOnClodinary(avatarLocalPath)
       const coverImage= await uploadOnClodinary(coverImageLocalPath)



       if (!avatar) {
         throw new ApiError(400," avatar is not uploaded ")
       }

     const user = await User.create({
                fullname,
                password,
                username: username.toLowerCase(),
                email,
                avatar: avatar.url,
                coverimage: coverImage?.url || "" // this line check aur cover image 
            })

     const createUser=await User.findById(user._id).select("-password -referstoken")

     if(!createUser){
        throw new ApiError(500, "something went wrong during registration")
     }
    
    return res.status(201).json(
        new Response(200,createUser,"user registered successflly")
     )


})

const loginUser=asynHandler(async(req,res,next)=>{
 
const { email, username, password}=req.body;

   if(!email  && !username){
      throw new ApiError(403,"email or password is required")
   }

   const user = await User.findOne({
      $or:[{email},{username}]
   })

   if(!user){
      throw new ApiError(401,"user is not found")
   }

   if(!password){
      throw new ApiError(403, "password is required")
   }


   const isPasswordValid= await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401,"your password and email is not match")
   }

  const {refreshToken,accessToken}=await generateRefreshAndAccessToken(user._id)

  const loggedInUser=await User.findById(user._id).select("-refreshToken -password")

  

  return res
  .status(200)
  .cookie('accessToken',accessToken,option)
  .cookie('refreshToken',refreshToken,option)
  .json(
   new Response(
      200,
      {
         user:loggedInUser,
          accessToken,
          refreshToken
      },
      "user logedin successfully"
   )
  )

 

})

 const logOut= asynHandler(async (req,res)=>{
      User.findByIdAndUpdate(
         req.user._id,
         {
            $set: {refreshToken:undefined}
         },
         {new:true}
      )

       const option={
      httpOnly:true,
      secure:true
  }

 return res
  .status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(
   new Response(200,{},"user loged out")
  )


  })


  const refreshAccessToken = asynHandler(async(req,res)=>{

   const incomingRefreshToken= await req.cookies.refreshToken||req.body.refreshToken

   try {
      if(!incomingRefreshToken){
         throw new ApiError(401,"token is not right or recieve"); 
      }
   
      const decodedToken=await jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )
   
      const user=await User.findById(decodedToken?._id)
   
      if(!user){
         throw new ApiError(401,"invalid refresh token")
      }
   
      if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"invalid token")
      }
   
      const {accessToken,refreshToken}= await generateRefreshAndAccessToken(user._id)
   
      return res
      .status(200)
      .cookie('accessToken',accessToken,option)
      .cookie('refreshToken',refreshToken,option)
      .json(
         new Response(
            200,
            {
               refreshToken,
               accessToken
            },
            "token is refresh successfully"
         )
      )
   } catch (error) {
      throw new ApiError(401,error?.message || "invalid token")
   }

  })

export {registerUser,loginUser,logOut,refreshAccessToken}
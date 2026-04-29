
import dotenv from "dotenv"
dotenv.config({ path: "./.env" })

import {v2 as cloudinary} from "cloudinary";
import { log } from "console";
import fs from "fs/promises";


 cloudinary.config({
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });


const uploadOnClodinary= async (localFilePath)=>{
    try{
        if(!localFilePath) return null

          const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
         })
         console.log("file is uploaded on cloudinary : ", response.url);
         
         return response;
    }
    catch(error){
        fs.unlink(localFilePath)
        console.log("cloudinary error : ", error);
        return null;
        
    }
   
}

export {uploadOnClodinary};
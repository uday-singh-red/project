import mongoose from "mongoose"
import express from "express"
import {mongo_name} from "../constant.js"

const connectDB= async()=>{
    try{

       const conectionInstance=await mongoose.connect(`${process.env.MONGOO_DB}/${mongo_name}`);

       console.log(`\n databas connected and HOST : ${conectionInstance.connection.host}`);

    }catch(error){
        console.log('we have FAILED', error)
        process.exit(1)
    }
}

export default connectDB;
import dotenv from "dotenv"
import connectDB from './db/index.js'

dotenv.config({
    path:'./.env'
})


connectDB();

  /*
import express from "express"

const app= express();

(async()=>{
    try{
       await mongoose.connect(`${process.env.MONGOO_DB}/${DB_name}`)

       app.on('error', ()=>{
        console.log('ERROR',error)
        throw error;
       })

       
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening ${process.env.PORT}`)
        })

            
        }catch(error){
            console.log('ERROR',error)
            throw error
        }
})()
        */
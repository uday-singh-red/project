import express, { Router } from 'express'
import cors from 'cors'

const app= express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({limit: '16kb', extended:true}))

app.use(express.static("public"))


//import router

import { router } from './routes/user.routes.js';

app.use("/api/v1/users", router)

export { app }
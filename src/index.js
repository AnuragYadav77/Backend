// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";


// import mongoose from "mongoose";
// import {DB_NAME} from "./constants" 


dotenv.config({
    path:'./env'
})

connectDB()





///////////////////APPROACH - 1////////////////
/*
import express from "express"
const app=express()

(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR:".error);
            throw error
        })

        app.listen(process.env.port,()=>{
            console.log(`App is listening on port ${process.env.port}`);
        })

    }
    catch(error){
        console.error("Error:",error)
        throw err
    }
})()


*/
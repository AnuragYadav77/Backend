import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/async-handler.js";

import jwt from "jsonwebtoken"
  


//this middleware will verify that the user id present are not
export const verifyJWT = asyncHandler(async(req, _,next)=>{
   try {
     //taking access of token
   const token=   req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
   if (!token) {
     throw new ApiError(401,"Unauthorised request")
   }
 
   //verifying using jwt whether the token is correct or not
  const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
  if (!user) {
 
     throw new ApiError(401,"Invalid Access Token")
  }
  req.user=user;
  next()
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access Token")
   }

})
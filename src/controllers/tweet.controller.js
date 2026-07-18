import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//create tweet
const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    
    if (!content) {
        throw new ApiError(400,"Content is required")        
    }

    const tweet = Tweet.create({
        content,
        owner:req.user?._id
    })

    if(!tweet){
        throw new ApiError(500,"Failed to create tweet, please try again later!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet created successfully")
    )
})

//get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid userId");
    }

    const tweets = await Tweet.aggregate(
        [
            {
                $match:{
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"ownerDetails",
                    pipeline:[
                        {
                            $project:{
                                username:1,
                                "avatar.url":1,
                            }
                        }
                    ]
                }
            },
            {
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"likeDetails",
                    pipeline:[
                        {
                            $project:{
                                likedBy:1,
                            },
                        },
                    ]
                },
            },
            {
              $addFields:{
                likesCount:{
                    $size:"$likeDetails"
                },
                ownerDetails:{
                    $first:"$ownerDetails",
                },
                isLiked:{
                    $cond:{
                        if:{$in:[req.user?._id,"$likeDetails.likedBy"]},
                        then:true,
                        else:false
                    }
                }
                }
            },
            {
                $sort:{
                    createdAt:-1
                }
            },
            {
                $project:{
                    content:1,
                    ownerDetails:1,
                    likesCount:1,
                    createdAt:1,
                    isLiked:1
                }
            }
        ]
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"Tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
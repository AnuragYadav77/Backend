import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteOnCLoudinary} from "../utils/cloudinary.js"
import {comment} from "../models/comment.model.js"



// get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const pipeline = []

    if(query){
        pipeline.push({
            $search:{
                index:"search-videos",
                text:{
                    query:query,
                    path:["title","description"] //search only on title, desc
                }
            }
        })
    }

    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400,"Invalid userId")
        }

        pipeline.push({
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        })
    }

    //fetch only those videos that have isPublished as 'true'
    pipeline.push({$match:{isPublished:true}});

    //sortBy - can be views,createdAt,durartion
    //sortType - can be ascending(1) or desc(-1)

    if(sortBy && sortType){
        pipeline.push({
            $sort:{
                [sortBy]:sortType === "asc"?1:-1
            }
        })
    }else{
        pipeline.push({$sort:{createdAt:-1}})
    }
    pipeline.push(
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[
                    {
                        $projects:{
                            username:1,
                            "avatar.url":1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$ownerDetails"
        }
    )
    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page:parseInt(page,10),
        limit:parseInt(limit,10)
    }

    const video = await Video.aggregatePaginate(videoAggregate,options);

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Videos fetched suucessfully")
    )



})

//get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if([title,description].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required!");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if(!videoFileLocalPath){
        throw new ApiError(400,"VideoFileLocalPath is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400,"thumbnailLocalPath is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new ApiError(400,"Video file not found!");
    }

    if(!thumbnnail){
        throw new ApiError(400,"Thumbnail not found!");
    }

    const video = await Video.create({
        title,
        description,
        duration:videoFile.duration,
        videoFile:{
            url:videoFile.url,
            public_id:videoFile.public_id
        },
        thumbnail:{
            url:thumbnail.url,
            public_id:thumbnail.public_id
        },
        owner:req.user?._id,
        isPublished:false
    })

    const videoUploaded = await Video.findById(video._id);

    if(!videoUploaded){
        throw new ApiError(500,"Failed to upload video, please try again!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video uploaded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
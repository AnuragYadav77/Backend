import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteOnCLoudinary} from "../utils/cloudinary.js"
import {comment} from "../models/comment.model.js"
import { PREPAGINATION_PLACEHOLDER } from "mongoose-aggregate-paginate-v2"



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

//get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId");
    }

    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400,"Invalid UserId");
    }

    const video = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribers"
                        }
                    },
                    {
                        $addFields:{
                            subcribersCount:{
                                $size:"$subscribers"
                            },
                            //check whether the currently logged-in user is subscribed to the video owner's channel.
                            isSubscribed:{
                                $cond:{
                                    if:{
                                        $in:[req.user?._id,"$subscribers.subscriber"]
                                    },
                                    then:true,
                                    else:false
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            username:1,
                            "avatar.url":1,
                            subscribersCount:1,
                            isSubscribed:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                owner:{
                    $first:"$owner"
                },
                isLiked:{
                    $cond:{
                        if:{$in:[req.user?._id,"$likes.likedBy"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                "videoFile.url":1,
                title:1,
                description:1,
                views:1,
                createdAt:1,
                duration:1,
                comments:1,
                owner:1,
                likesCount:1,
                isLiked:1

            }
        }
    ])

    if(!video){
        throw new ApiError(500,"Failed to fetch video")
    }

    //increase views (by 1) if video is fetched successfully
    await Video.findByIdAndUpdate(videoId,{
        $inc:{
            views:1
        }
    })

    // add this video to user watch history

    await User.findByIdAndUpdate(req.user?._id,{
        $addToSet:{
            watchHistory:videoId
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,video[0],"Video details fetched successfully")
    )

})

//update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    
    // 1. Prepare update object dynamically (Optional fields)
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    // 2. Handle Thumbnail Upload (Optional)
    let thumbnailToDelete = null;
    if (req.file?.path) {
        // Fetch video ONLY if we need the old thumbnail ID
        const video = await Video.findById(videoId);
        if (!video) throw new ApiError(404, "No video found");
        
        // Check Ownership
        if (video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Only owner can edit");
        }

        thumbnailToDelete = video.thumbnail.public_id;
        
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (!thumbnail) throw new ApiError(500, "Upload failed");

        updateData.thumbnail = {
            public_id: thumbnail.public_id,
            url: thumbnail.url
        };
    } else {
        // If no file, we still need to check ownership if updating text
        if (Object.keys(updateData).length > 0) {
             const video = await Video.findById(videoId);
             if (!video) throw new ApiError(404, "No video found");
             if (video.owner.toString() !== req.user._id.toString()) {
                throw new ApiError(403, "Only owner can edit");
             }
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No data provided to update");
    }

    // 3. Single Atomic Update (Combines Find, Check Owner, and Update)
    // If you didn't fetch video earlier for thumbnail, you must include owner in filter
    // Note: Since we checked ownership above for thumbnail logic, we can skip re-checking 
    // if we trust the flow, but for pure atomic safety without prior fetch:
    
    /* 
       PURE ATOMIC APPROACH (Requires knowing owner ID beforehand or trusting the prior fetch):
       If we fetched 'video' above, we already validated ownership. 
       We can just update by ID. 
    */
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId, 
        { $set: updateData }, 
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Update failed");
    }

    // 4. Delete Old Image (Non-blocking / Fire-and-forget)
    if (thumbnailToDelete) {
        // Do not await here to speed up response. 
        // Handle errors internally in delete function if needed.
        deleteOnCloudinary(thumbnailToDelete).catch(err => 
            console.error("Failed to delete old thumbnail:", err)
        );
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});   

//delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(video?.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(400,"Only owner can delete the video");
    }

    const videoToDelete = await Video.findByIdAndDelete(video?._id);

    if(!videoToDelete){
        throw new ApiError(500,"Failed to delete the video, please try again!")
    }

    await deleteOnCLoudinary(video.thumbnail.public_id);
    await deleteOnCLoudinary(video.videoFile.public_id);

    //delete video likes

    await Like.deleteMany({
        video:videoId
    })

    //delete video comments

    await comment.deleteMany(
        {
            video:videoId
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Video deleted!")
    )
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
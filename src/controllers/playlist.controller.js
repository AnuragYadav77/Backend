import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


//create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if(!name || !description){
        throw new ApiError(400,"Name and Description both are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(500,"Failed to create PLaylist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist created successfully")
    )


})

//get user playlists(Return all playlists created by a particular user.)
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid userId")
    }

    const playlists= await Playlist.aggregate([
        {
            $match:{
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $addFields:{
                totalVideos:{
                    $size:"$videos"
                },
                totalViews:{
                    $sum:"$videos.views"
                }
            }
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                totalVideos:1,
                totalViews:1,
                updatedAt:1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse (200,playlists,"User playlists fetched successfully"))
})

//get playlist by id(Return one specific playlist.)
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    const playlistVideos = await PLaylist/aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $match:{
                "videos.isPublished":true
            }
        },
        {
            $addFields:{
                totalVideos:{
                    $size:"$videos"
                },
                totalViews:{
                        $sum:"$videos.views"
                },
                owner:{
                    $first:"$owner"
                }
                
            }
        },
        {
            $project:{
                name:1,
                description:1,
                createdAt:1,
                updatedAt:1,
                totalVideos:1,
                totalViews:1,
                videos:{
                    _id:1,
                    "videosFile.url":1,
                    "thumbnail.url":1,
                    title:1,
                    description:1,
                    duration:1,
                    createdAt:1,
                    views:1
                },
                owner:{
                    username:1,
                    fullName:1,
                    "avatar.url":1
                }
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlistVideos[0],"playlist fetched successfully")
    )

})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid PlaylistId or VideoId")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found!")
    }

    if(!video){
        throw new ApiError(404,"Video not found!")
    }

    if(playlist.owner?.toString() && video.owner?.toString() !==req.user?._id.toString()){
        throw new ApiError(400,"Only owner have rights to add videos to their playlist");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $addToSet:{
                videos:videoId,
            }
        },
        {new :true}

    )

    if(!updatePlaylist){
        throw new ApiError(400,"Failed to add video to playlist, please try again!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatePlaylist,"Added video to playlist successfully")
    )

})

//remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlistId or videId");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if(playlist.owner?.toString() && video.owner?.toString()!==req.user?._id.toString()){
        throw new ApiError(404,"Only owner can delete the video from the playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Removed video from playlist successfully")
        )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
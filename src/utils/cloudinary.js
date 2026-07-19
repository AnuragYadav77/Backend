import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
const uploadOnCloudinary= async(localFilePath)=>{
    try{
       if(!localFilePath) return null;
       //uplaod the file
       const response =await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto" //automatically detects the file type
       })
       //file has been uploaded successfully
    //    console.log("File is uploaded on cloudinary",response.url);
    fs.unlinkSync(localFilePath)
       return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temp file as the upload operation got failed
        return null;
    }
}

const deleteOnCLoudinary = async (puublic_id,resource_type="image")=>{
    try {
        if(!public_id) return null;

        //delete file from cloudinary
        const result = await cloudinary.uploader.destroy(public_id,{
            resource_type:`${resource_type}`
        });
    } catch (error) {
        return error;
        console.log("Delete on cloudinary failed",error);
    }
}

export {uploadOnCloudinary,deleteOnCLoudinary}


//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();
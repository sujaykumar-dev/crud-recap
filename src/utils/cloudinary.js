import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadONCLouidinary=async (localFilePath)=>{
    try {
        //if filepath doesn't exist , return null 
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploadedf successfully'
        //console.log("File is uploaded on CLoudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {   
        fs.unlinkSync(localFilePath) //remove the loaclly saved temp file
        console.error("Error Uploading file:",error)
        return null;
    }
}
 export {uploadONCLouidinary}
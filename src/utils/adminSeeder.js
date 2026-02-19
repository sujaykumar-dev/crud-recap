import { User } from "../models/users.model.js";
import { configDotenv } from "dotenv";
export const ensureAdminExists=async()=>{
    try {
        const adminExists = await User.exists({role:"admin"})
        if(adminExists){
            console.log("Admin already Exists, Skipping bootstrap.")
            return;
        }

        if(!process.env.ALLOW_ADMIN_BOOTSTRAP){
            console.log("Admin Bootstrap is Disabled")
            return;
        }

        const admin= await User.create({
            username:process.env.INIT_ADMIN_USERNAME,
            email:process.env.INIT_ADMIN_EMAIL,
            password:process.env.INIT_ADMIN_PASSWORD,
            role:"admin"
        })

        console.log("Initial Admin Created")

    } catch (error) {
        console.error("Error during admin bootstrap",error)
        throw error;
    }
}
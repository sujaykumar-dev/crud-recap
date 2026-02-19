
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { ensureAdminExists } from "./utils/adminSeeder.js";
dotenv.config();

connectDB().then(async ()=>{

    await ensureAdminExists()
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch(error=>{
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
});

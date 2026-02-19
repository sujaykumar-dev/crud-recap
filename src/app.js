import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({
    limit:"16kb"
}))
app.use(urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/users.routes.js"
import contactRouter from "./routes/contacts.routes.js"
import adminRouter from "./routes/admin.routes.js"
app.use("/api/v1/contacts",contactRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/admin",adminRouter)
export default app
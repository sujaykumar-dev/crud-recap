import mongoose,{  Schema } from "mongoose";


const auditLogSchema= new Schema({
    actor:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    action:{
        type:String,
        required:true
    },
    targetModel:{
        type:String,
        required:true
    },
    targetId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    metadata:{
        type:Object
    }
},{timestamps:true})

export const AuditLog=mongoose.model("AuditLog",auditLogSchema)
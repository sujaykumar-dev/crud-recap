import mongoose, { Schema } from "mongoose";

const contactSchema= new Schema({
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    name:{
        type:String,
        required:true,
        trim:true,
        index:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        index:true
    },
    isDeleted:{
        type:Boolean,
        default:false,
        index:true
    },
    deletedAt:{
        type: Date
    }
},{timestamps:true})
contactSchema.pre(/^find/,function(){
    if(!this.getOptions().includeDeleted){
        this.where({isDeleted:false});
    }
  
})
export const Contact = mongoose.model("Contact",contactSchema)
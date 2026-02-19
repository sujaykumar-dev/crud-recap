import { Mongoose } from "mongoose";
import { ApiError } from "./ApiError.js";


export const paginate = async (model,filter={},query={},options={})=>{
    const page=parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit)|| 10,options.maxLimit ||100)

    if(page<1 || limit<1){
        throw new ApiError(400,"Invalid Pagination Parameters")
    }
    const skip = (page-1)*limit;
    let sort = {createdAt:-1}
    if(query.sort){
        const [field,order]= query.sort.split("_")
        sort = {[field]:order==="asc"? 1 : -1};

    }
    
    let mongooseQuery =  model.find(filter) 
    
    if(options.includeDeleted){
        mongooseQuery=mongooseQuery.setOptions({includeDeleted:true})
    }

    const data = await mongooseQuery
    .sort(sort)
    .limit(limit)
    .skip(skip)
    const countFilter=options.includeDeleted?
    filter:{...filter,isDeleted:{$ne:true}}
    const total = await model.countDocuments(countFilter)
    return {
        data,
        pagination:{
            total,
            page,
            limit,
            totalPages:Math.ceil(total/limit)
        }
    }
}
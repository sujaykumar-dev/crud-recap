import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contact } from "../models/contacts.model.js";
import { paginate } from "../utils/pagination.js";


//User Accessed Controllers


const getAllContacts = asyncHandler(async (req, res) => {
  const result=await paginate(
    Contact,
    {owner:req.user._id},
    req.query
  )
  return res.status(200)
    .json(new ApiResponse(200,result,"All Contacts fetched successfully"));
});

const getContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id?.trim()) {
    throw new ApiError(401, "user ID missing");
  }

  const entry = await Contact.findOne({
    _id:id,
    owner:req.user._id
  })

  if (!entry) {
    throw new ApiError(404, "No Contacts found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, entry, "Contact Fetched Sucessfully"));
});

const createContact = asyncHandler(async (req, res) => {
  // console.log(`ConTACT: `, req.body)

  const { name, email, phone } = req.body;

  if ([name, email, phone].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedEntry = await Contact.findOne({
    $or: [{ name }, { phone }],
    owner:req.user._id
  }).setOptions({includeDeleted:true});

  if (existedEntry && !existedEntry.isDeleted) {
    throw new ApiError(401, "Contact Already Exists");
  }
  if (existedEntry && existedEntry.isDeleted) {
    existedEntry.name=name;
    existedEntry.phone=phone;
    existedEntry.email=email;
    await existedEntry.save();
    return res.status(200).json(new ApiResponse(200,existedEntry,"Contact Restored sucessfully"))
  }


  const contact = await Contact.create({
    name,
    email,
    phone,
    owner:req.user._id
  });

  const createdEntry = await Contact.findById(contact._id);

  if (!createdEntry) {
    throw new ApiError(500, "Error adding contact information. Retry");
  }
  res
    .status(200)
    .json(new ApiResponse(200, createdEntry, "Contact added successfully"));
});

const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {name, email, phone} = req.body
  if (!id?.trim()) {
    throw new ApiError(401, "user ID missing");
  }
  if(!name && !email && !phone){
    throw new ApiError(401,"No fields to update")
  }
  const entry = await Contact.findOneAndUpdate(
    {_id:id,owner:req.user._id},
    {$set:{name,email,phone}},
    {new:true}
  );

  if (!entry) {
    throw new ApiError(404, "No Contacts found!");
  }

  return res.status(200).json(new ApiResponse(200,entry,"Contact information updated successfully"))
});

const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id?.trim()) {
    throw new ApiError(400, "user ID missing");
  }

  const contact = await Contact.findOne({
    _id:id,   
    owner:req.user._id
  }).setOptions({includeDeleted:true})

  if (!contact) {
    throw new ApiError(404, "No Contacts found!");
  }
  if(contact.isDeleted){
    throw new ApiError(400,"Contact is already deleted")
  }

  contact.isDeleted=true;
  contact.deletedAt=new Date();
  await contact.save()
  return res
    .status(200)
    .json(new ApiResponse(200, contact, "Contact Deleted Sucessfully"));
});

//Privilaged Access Controllers

const getAllDatabaseContacts= asyncHandler(async(req,res)=>{
  const result=await paginate(
    Contact,
    {},
    req.query,
    {includeDeleted:true}
  )
  return res.status(200).json(new ApiResponse(201,result,"All Database Contacts fetched Successfully"))
})

const getUserContact=asyncHandler(async(req,res)=>{
  const {id}=req.params
  if(!id){
    throw new ApiError(400,"User ID required!")
  }
  const result = await paginate(
    Contact,
    {owner:id},
    req.query,
    {includeDeleted:true}
  )
  return res
    .status(200)
    .json(new ApiResponse(200, result, "All Contacts fetched successfully"));

})  

const getContactByID=asyncHandler(async(req,res)=>{
  const { id } = req.params;
  if (!id?.trim()) {
    throw new ApiError(401, "user ID missing");
  }

  const entry = await Contact.findOne({
    _id:id
  }).setOptions({includeDeleted:true})

  if (!entry) {
    throw new ApiError(404, "No Contacts found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, entry, "Contact Fetched Sucessfully"));
})


export {
  getAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getAllDatabaseContacts,
  getUserContact,
  getContactByID
};


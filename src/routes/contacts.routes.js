import { Router } from "express";
import { createContact, deleteContact, getAllContacts, getAllDatabaseContacts, getContact, getContactByID, getUserContact, updateContact } from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/").get(getAllContacts)
router.route("/:id").get(getContact)
router.route("/").post(createContact)
router.route("/:id").put(updateContact)
router.route("/:id").delete(deleteContact)

export default router
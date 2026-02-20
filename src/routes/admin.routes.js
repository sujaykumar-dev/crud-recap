import { Router } from "express";   
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { getAllDatabaseContacts, getContactByID, getUserContact } from "../controllers/contact.controller.js";
import { deleteUser, getAllUsers, getAuditLogs, getUserByID, restore, updateUserRole } from "../controllers/user.controller.js";


const router = Router()

router.use(verifyJWT)

router.route("/users").get(requireRole("admin"),getAllUsers)
router.route("/users/:id").get(requireRole("admin"),getUserByID)
router.route("/users/:id/contacts").get(requireRole("admin"),getUserContact)
router.route("/users/:id/promote").patch(requireRole("admin"),updateUserRole("admin"))
router.route("/users/:id/delete").delete(requireRole("admin"),deleteUser)
router.route("/users/:id/restore").patch(requireRole("admin"),restore)

router.route("/contacts").get(requireRole("admin"),getAllDatabaseContacts)
router.route("/contacts/:id").get(requireRole("admin"),getContactByID)

router.route("/audit-logs").get(requireRole("admin"),getAuditLogs)
export default router
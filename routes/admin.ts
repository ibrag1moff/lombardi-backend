import { isAdmin, verifyToken } from "../middlewares/auth";
import {
  assignAdmin,
  banUser,
  getAdmins,
  getUsers,
  revokeAdmin,
} from "../controllers/admin";
import express from "express";
import { deleteSubscriber } from "../controllers/newsletter";

const router = express.Router();

router.post("/assign-admin", verifyToken, isAdmin, assignAdmin);

router.post("/revoke-admin", verifyToken, isAdmin, revokeAdmin);

router.post("/ban", verifyToken, isAdmin, banUser);

router.get("/users", verifyToken, isAdmin, getUsers);

router.get("/admins", verifyToken, isAdmin, getAdmins);

router.delete("/delete-subscriber", verifyToken, isAdmin, deleteSubscriber);

export { router as adminRouter };

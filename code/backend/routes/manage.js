import express from "express";
import {
  getAllEquipment,
  getEquipmentById,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  addStock,
  removeStock,
  getSports,
  addSport
} from "../controllers/manageController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getAllEquipment);

router.get("/sports/list", authenticateToken, getSports);
router.post("/sports/add", authenticateToken, authorizeRole(['admin']), addSport);

router.get("/:id", authenticateToken, getEquipmentById);

router.post("/", authenticateToken, authorizeRole(['admin', 'counter-staff']), addEquipment);

router.put("/:id", authenticateToken, authorizeRole(['admin', 'counter-staff']), updateEquipment);

router.delete("/:id", authenticateToken, authorizeRole(['admin', 'counter-staff']), deleteEquipment);

router.patch("/:id/add-stock", authenticateToken, authorizeRole(['admin', 'counter-staff']), addStock);

router.patch("/:id/remove-stock", authenticateToken, authorizeRole(['admin', 'counter-staff']), removeStock);

export default router;
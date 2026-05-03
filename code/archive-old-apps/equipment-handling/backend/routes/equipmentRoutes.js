import express from "express";
import {
  getAllEquipment,
  getEquipmentById,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  addStock,
  removeStock
} from "../controllers/equipmentController.js";

const router = express.Router();

/* Equipment List Page (supports search) */
router.get("/", getAllEquipment);

/* Get single equipment (for Update Stock page) */
router.get("/:id", getEquipmentById);

/* Add new equipment */
router.post("/", addEquipment);

/* Update equipment details */
router.put("/:id", updateEquipment);

/* Delete equipment completely */
router.delete("/:id", deleteEquipment);

/* Add stock */
router.patch("/:id/add-stock", addStock);

/* Remove stock */
router.patch("/:id/remove-stock", removeStock);

export default router;
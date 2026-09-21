// alert.routes.js
import { Router } from "express";
import { getAlerts, getAlertById, updateAlert } from "../controllers/alert.controller.js";

const router = Router();

router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.patch("/:id", updateAlert);

export default router;

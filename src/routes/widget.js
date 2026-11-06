import express from "express";
import { start } from "../controllers/widget.js";
import { widgetStartValidation } from "../middlware/validation.js";

export const router = express.Router();

router.post("/", widgetStartValidation, start);

export default router;
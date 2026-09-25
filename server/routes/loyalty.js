import express from "express";
import { getLoyaltySummary, LOYALTY } from "../loyalty.js";

const router = express.Router();

/*
 A customer's loyalty point balance.
 GET /loyalty?customerId=<username>
*/
router.get("/", async (req, res) => {
  const customerId = typeof req.query.customerId === "string" ? req.query.customerId.trim() : "";
  if (!customerId) {
    return res.status(400).json({ error: "customerId is required." });
  }
  try {
    res.status(200).json({ ...(await getLoyaltySummary(customerId)), ...LOYALTY });
  } catch (error) {
    console.error("Error loading loyalty points:", error);
    res.status(500).json({ error: "Unable to load loyalty points." });
  }
});

export default router;

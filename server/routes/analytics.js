import express from "express";
import { getSalesAnalytics } from "../analytics/salesAnalytics.js";

const router = express.Router();

/*
 Monthly sales analytics from the sales CSV.
 GET /analytics/sales?month=YYYY-MM (defaults to the latest month in the data)
*/
router.get("/sales", async (req, res) => {
  const month = typeof req.query.month === "string" ? req.query.month.trim() : "";
  if (month && !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "month must look like YYYY-MM." });
  }

  try {
    res.status(200).json(await getSalesAnalytics(month || undefined));
  } catch (error) {
    console.error("Error building sales analytics:", error);
    res.status(500).json({ error: "Sales analytics are unavailable right now." });
  }
});

export default router;

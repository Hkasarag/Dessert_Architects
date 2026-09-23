import express from "express";
import { randomUUID } from "node:crypto";
import db from "../db/connection.js";

const router = express.Router();
const inventory = () => db.collection("inventory");

const isFiniteNumber = value => typeof value === "number" && Number.isFinite(value);

const createTransactionId = () =>
  `INV-${Date.now().toString().slice(-8)}-${randomUUID().slice(0, 8).toUpperCase()}`;

const buildInventoryTransaction = body => {
  if (!body || !Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return { error: "An inventory transaction must contain at least one line item." };
  }

  const lineItems = body.lineItems.map(item => {
    const quantity = Number(item.quantity);
    const unitCost = Number(item.unitCost);

    return {
      ingredientId: String(item.ingredientId ?? ""),
      ingredientName: String(item.ingredientName ?? ""),
      category: String(item.category ?? ""),
      quantity,
      unitOfMeasure: String(item.unitOfMeasure ?? ""),
      unitCost,
      extendedCost: Number.isFinite(Number(item.extendedCost))
        ? Number(item.extendedCost)
        : quantity * unitCost,
      lotNumber: item.lotNumber ? String(item.lotNumber) : null,
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate).toISOString().slice(0, 10)
        : null,
      storageLocation: String(item.storageLocation ?? "Dry Storage"),
    };
  });

  if (lineItems.some(item =>
    !item.ingredientId ||
    !item.ingredientName ||
    !item.category ||
    !item.unitOfMeasure ||
    !Number.isInteger(item.quantity) ||
    item.quantity <= 0 ||
    !isFiniteNumber(item.unitCost) ||
    item.unitCost < 0 ||
    !isFiniteNumber(item.extendedCost) ||
    item.extendedCost < 0
  )) {
    return { error: "Each inventory line item must have valid ingredient and pricing details." };
  }

  const totalCost = Number(body.totalCost);
  if (!isFiniteNumber(totalCost) || totalCost < 0) {
    return { error: "Inventory totalCost must be a non-negative number." };
  }

  const transactionDate = body.transactionDate
    ? new Date(body.transactionDate)
    : new Date();
  if (Number.isNaN(transactionDate.getTime())) {
    return { error: "transactionDate must be a valid date." };
  }

  return {
    transaction: {
      inventoryTransactionId: String(body.inventoryTransactionId || createTransactionId()),
      locationId: String(body.locationId || "ATL001"),
      transactionDate: transactionDate.toISOString(),
      transactionType: String(body.transactionType || "Purchase"),
      totalCost,
      lineItems,
      createdAt: new Date(),
    },
  };
};

const createInventory = async (req, res, next) => {
  // Let the existing customer-order router handle ordinary order payloads.
  if (!Array.isArray(req.body?.lineItems)) {
    return next();
  }

  try {
    const { transaction, error } = buildInventoryTransaction(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const result = await inventory().insertOne(transaction);
    res.status(201).json({ ...transaction, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating inventory transaction:", error);
    res.status(500).json({ error: "Error creating inventory transaction." });
  }
};

router.get("/", async (req, res) => {
  try {
    const locationId = typeof req.query.locationId === "string" ? req.query.locationId.trim() : "";
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 3;
    const filter = locationId ? { locationId } : {};
    const results = await inventory()
      .find(filter)
      .sort({ transactionDate: -1 })
      .limit(limit)
      .toArray();
    res.status(200).json(results);
  } catch (error) {
    console.error("Error retrieving inventory:", error);
    res.status(500).json({ error: "Error retrieving inventory." });
  }
});

router.post("/", createInventory);

export { createInventory };
export default router;
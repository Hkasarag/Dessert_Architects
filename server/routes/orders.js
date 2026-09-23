import express from "express";
import db from "../db/connection.js";
import { randomUUID } from "node:crypto";

const router = express.Router();
const orders = () => db.collection("orders");

const isFiniteNumber = value => typeof value === "number" && Number.isFinite(value);

const buildOrder = body => {
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return { error: "An order must contain at least one item." };
  }

  const items = body.items.map(item => ({
    productId: String(item.productId ?? ""),
    productName: String(item.productName ?? ""),
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    unitCost: Number(item.unitCost ?? 0),
  }));

  if (items.some(item =>
    !item.productId ||
    !item.productName ||
    !Number.isInteger(item.quantity) ||
    item.quantity <= 0 ||
    !isFiniteNumber(item.unitPrice) ||
    item.unitPrice < 0 ||
    !isFiniteNumber(item.unitCost) ||
    item.unitCost <= 0
  )) {
    return { error: "Each order item must have valid product and pricing details." };
  }

  const subtotal = Number(body.subtotal);
  const tax = Number(body.tax);
  const total = Number(body.total);

  if (![subtotal, tax, total].every(isFiniteNumber) || subtotal < 0 || tax < 0 || total < 0) {
    return { error: "Order totals must be non-negative numbers." };
  }

  return {
    order: {
      orderId: String(body.orderId || randomUUID()),
      customerId: String(body.customerId ?? ""),
      createdAt: body.createdAt ? new Date(body.createdAt).toISOString() : new Date().toISOString(),
      status: "Pending",
      subscriptionType: String(body.subscriptionType || "None"),
      subtotal,
      tax,
      total,
      items,
    },
  };
};

/*
 Get all orders
*/
router.get("/", async (req, res) => {
  try {
    const customerId = typeof req.query.customerId === "string" ? req.query.customerId.trim() : "";
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 3;
    const filter = customerId ? { customerId } : {};
    const results = await orders()
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving orders." });
  }
});

/*
 Create new order
*/
router.post("/", async (req, res) => {
  try {
    const { order, error } = buildOrder(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const result = await orders().insertOne(order);
    res.status(201).json({ ...order, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating order." });
  }
});

export default router;
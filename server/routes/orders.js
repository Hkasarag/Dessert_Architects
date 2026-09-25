import express from "express";
import db from "../db/connection.js";
import { randomUUID } from "node:crypto";
import { getLoyaltySummary, LOYALTY, maxPointsFor, pointsEarnedFor } from "../loyalty.js";

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

  const loyaltyPointsRedeemed = body.loyaltyPointsRedeemed === undefined ? 0 : Number(body.loyaltyPointsRedeemed);
  if (!Number.isInteger(loyaltyPointsRedeemed) || loyaltyPointsRedeemed < 0) {
    return { error: "Loyalty points must be a whole number of zero or more." };
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
      loyaltyPointsRedeemed,
      loyaltyDiscount: Math.round(loyaltyPointsRedeemed * LOYALTY.pointValue * 100) / 100,
      // Orders paid partly with points don't earn new points.
      loyaltyPointsEarned: loyaltyPointsRedeemed > 0 ? 0 : pointsEarnedFor(total),
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

    if (order.loyaltyPointsRedeemed > 0) {
      if (!order.customerId) {
        return res.status(400).json({ error: "Sign in to use loyalty points." });
      }
      const { balance } = await getLoyaltySummary(order.customerId);
      if (order.loyaltyPointsRedeemed > balance) {
        return res.status(400).json({ error: `You only have ${balance.toLocaleString("en-US")} loyalty points.` });
      }
      // subtotal is the amount after promo codes and before tax; points can't exceed it.
      const maxPoints = maxPointsFor(order.subtotal);
      if (order.loyaltyPointsRedeemed > maxPoints) {
        return res.status(400).json({ error: `This order can use at most ${maxPoints.toLocaleString("en-US")} loyalty points.` });
      }
    }

    const result = await orders().insertOne(order);
    const { balance } = order.customerId ? await getLoyaltySummary(order.customerId) : { balance: 0 };
    res.status(201).json({ ...order, _id: result.insertedId, loyaltyBalance: balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating order." });
  }
});

export default router;
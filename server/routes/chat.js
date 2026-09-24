import express from "express";
import { AiConfigError } from "../ai/azureClient.js";
import { handleChat } from "../agents/orchestrator.js";

const router = express.Router();

const ROLES = new Set(["customer", "admin"]);
const MAX_TURNS = 12;
const MAX_MESSAGE_CHARS = 4000;
const MAX_CART_ITEMS = 50;

const parseHistory = messages => {
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const history = messages
    .slice(-MAX_TURNS)
    .filter(m => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, MAX_MESSAGE_CHARS) }));
  return history.at(-1)?.role === "user" ? history : null;
};

const parseCart = cart =>
  (Array.isArray(cart) ? cart : []).slice(0, MAX_CART_ITEMS).map(item => ({
    name: String(item?.name ?? "").replace(/[^\p{L}\p{N}\s'&-]/gu, "").trim(),
    quantity: Number(item?.quantity) || 0,
    price: Number(item?.price) || 0,
    isSubscription: Boolean(item?.isSubscription),
  })).filter(item => item.name && item.quantity > 0);

/*
 Send a chat turn to the agent orchestrator.
 Body: { role: "customer" | "admin", messages: [{ role, content }], customerId?, cart? }
*/
router.post("/", async (req, res) => {
  const { role, messages, customerId, cart } = req.body ?? {};

  if (!ROLES.has(role)) {
    return res.status(400).json({ error: "role must be \"customer\" or \"admin\"." });
  }
  const history = parseHistory(messages);
  if (!history) {
    return res.status(400).json({ error: "messages must end with a non-empty user message." });
  }

  try {
    const result = await handleChat({
      role,
      history,
      // Admins never get customer order history or cart data.
      customerId: role === "customer" && typeof customerId === "string" ? customerId.trim() : "",
      cart: role === "customer" ? parseCart(cart) : [],
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AiConfigError) {
      console.error(error.message);
      return res.status(503).json({ error: "The AI assistant isn't configured on the server yet." });
    }
    console.error("Chat request failed:", error);
    res.status(502).json({ error: "The AI assistant is unavailable right now. Please try again." });
  }
});

export default router;

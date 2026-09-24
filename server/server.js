import "./env.js";
import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders.js";
import inventoryRouter, { createInventory } from "./routes/inventory.js";
import chatRouter from "./routes/chat.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/inventory", inventoryRouter);
app.post("/orders", createInventory);
app.use("/orders", ordersRouter);
app.use("/chat", chatRouter);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

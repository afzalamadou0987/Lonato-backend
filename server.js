require("dotenv").config();
const express = require("express");
const cors = require("cors");

const gamesRoutes = require("./routes/games");
const ticketsRoutes = require("./routes/tickets");
const paymentRoutes = require("./routes/payment");
const drawsRoutes = require("./routes/draws");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://192.168.11.152:8081",
    "exp://192.168.11.152:8081",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/games", gamesRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/draws", drawsRoutes);

app.get("/", (req, res) => res.send("Lonato Backend - Module 1 API ✅"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Lonato backend sur http://localhost:${PORT}`));
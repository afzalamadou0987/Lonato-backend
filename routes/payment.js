const express = require("express");
const router = express.Router();
const { processMockPayment } = require("../services/paymentMock");

router.post("/test", async (req, res) => {
  const { method, phone, amount } = req.body;
  if (!method || !phone || !amount) {
    return res.status(400).json({ error: "method, phone et amount requis" });
  }
  const result = await processMockPayment({ method, phone, amount });
  res.json(result);
});

module.exports = router;
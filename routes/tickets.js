const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { processMockPayment } = require("../services/paymentMock");

// POST /api/tickets/checkout
router.post("/checkout", async (req, res) => {
  const { userId, gameId, selectedNumbers, amount, paymentMethod, phone, expoPushToken } = req.body;

  if (!userId || !gameId || !selectedNumbers?.length || !amount || !paymentMethod || !phone) {
    return res.status(400).json({ error: "Champs manquants pour le checkout" });
  }

  let { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("game_id", gameId)
    .eq("status", "scheduled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!draw) {
    const { data: newDraw, error: drawErr } = await supabase
      .from("draws")
      .insert({ game_id: gameId, status: "scheduled" })
      .select()
      .single();
    if (drawErr) return res.status(500).json({ error: drawErr.message });
    draw = newDraw;
  }

  const { data: ticket, error: ticketErr } = await supabase
    .from("tickets")
    .insert({
      user_id: userId,
      game_id: gameId,
      draw_id: draw.id,
      selected_numbers: selectedNumbers,
      amount,
      payment_method: paymentMethod,
      payment_status: "pending",
      status: "en_attente",
      expo_push_token: expoPushToken || null,
    })
    .select()
    .single();

  if (ticketErr) return res.status(500).json({ error: ticketErr.message });

  const payment = await processMockPayment({ method: paymentMethod, phone, amount });
  const paymentStatus = payment.success ? "paid" : "failed";
  const qrPayload = payment.success ? `LONATO|${ticket.id}|${gameId}|${amount}` : null;

  const { data: updatedTicket, error: updateErr } = await supabase
    .from("tickets")
    .update({ payment_status: paymentStatus, payment_ref: payment.payment_ref, qr_payload: qrPayload })
    .eq("id", ticket.id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  res.json({ ticket: updatedTicket, payment });
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*, games(name, numbers_to_pick, numbers_pool)")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Ticket introuvable" });
  res.json(data);
});

router.get("/user/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*, games(name)")
    .eq("user_id", req.params.userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
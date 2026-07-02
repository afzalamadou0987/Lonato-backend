const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { sendPushNotification } = require("../services/pushNotifications");

function generateWinningNumbers(pool, count) {
  const numbers = new Set();
  while (numbers.size < count) numbers.add(Math.floor(Math.random() * pool) + 1);
  return Array.from(numbers).sort((a, b) => a - b);
}

function countMatches(selected, winning) {
  return selected.filter((n) => winning.includes(n)).length;
}

function computeWinnings(matches, totalNumbers, amount) {
  if (matches === totalNumbers) return amount * 100;
  if (matches === totalNumbers - 1) return amount * 10;
  if (matches >= Math.ceil(totalNumbers / 2)) return amount * 2;
  return 0;
}

// POST /api/draws/simulate  body: { gameId }
router.post("/simulate", async (req, res) => {
  const { gameId } = req.body;
  if (!gameId) return res.status(400).json({ error: "gameId requis" });

  const { data: game, error: gameErr } = await supabase.from("games").select("*").eq("id", gameId).single();
  if (gameErr) return res.status(404).json({ error: "Jeu introuvable" });

  const { data: draw, error: drawErr } = await supabase
    .from("draws")
    .select("*")
    .eq("game_id", gameId)
    .eq("status", "scheduled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (drawErr || !draw) return res.status(404).json({ error: "Aucun tirage en attente pour ce jeu" });

  const winningNumbers = generateWinningNumbers(game.numbers_pool, game.numbers_to_pick);

  await supabase.from("draws").update({ winning_numbers: winningNumbers, status: "completed" }).eq("id", draw.id);

  const { data: tickets, error: ticketsErr } = await supabase
    .from("tickets")
    .select("*")
    .eq("draw_id", draw.id)
    .eq("payment_status", "paid")
    .eq("status", "en_attente");

  if (ticketsErr) return res.status(500).json({ error: ticketsErr.message });

  const results = [];

  for (const ticket of tickets) {
    const matches = countMatches(ticket.selected_numbers, winningNumbers);
    const winnings = computeWinnings(matches, game.numbers_to_pick, ticket.amount);
    const won = winnings > 0;

    await supabase
      .from("tickets")
      .update({ status: won ? "paye" : "perdant", winnings_amount: winnings })
      .eq("id", ticket.id);

    if (ticket.expo_push_token) {
      await sendPushNotification(
        ticket.expo_push_token,
        won ? "🎉 Ticket gagnant !" : "Résultat du tirage",
        won
          ? `Vous avez gagné ${winnings} F CFA, versé automatiquement !`
          : `Pas de chance cette fois pour votre ticket ${ticket.id.slice(0, 8)}.`,
        { ticketId: ticket.id }
      );
    }

    results.push({ ticketId: ticket.id, matches, winnings, won });
  }

  res.json({ draw: { ...draw, winning_numbers: winningNumbers, status: "completed" }, results });
});

module.exports = router;
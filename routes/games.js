const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { GAMES_SEED } = require("../data/gamesConfig");

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("games").select("*").eq("active", true);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// À appeler une seule fois pour initialiser les jeux
router.post("/seed", async (req, res) => {
  const { data, error } = await supabase.from("games").insert(GAMES_SEED).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ inserted: data.length, games: data });
});

module.exports = router;
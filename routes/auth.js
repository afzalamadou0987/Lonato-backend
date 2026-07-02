const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Numéro requis" });

  // Vérifier si l'utilisateur existe déjà
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  // En mode mock, on stocke juste le numéro et on répond succès
  // En prod, ici on enverrait un vrai SMS via Twilio
  console.log(`📱 OTP envoyé à ${phone} : 1234 (mock)`);
  res.json({ success: true, message: "OTP envoyé", mock: true });
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: "Champs manquants" });

  // Mock : code fixe 1234
  if (otp !== "1234") return res.status(401).json({ error: "Code incorrect" });

  // Créer ou récupérer l'utilisateur
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (!user) {
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({ phone, name: name || "Parieur", wallet: 0, created_at: new Date() })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    user = newUser;
  }

  res.json({ success: true, user });
});

// POST /api/auth/profile
router.get("/profile/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", req.params.userId)
    .single();
  if (error) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.json(data);
});

module.exports = router;
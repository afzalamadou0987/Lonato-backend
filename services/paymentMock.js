// Simule un paiement Flooz / T-Money.
// TODO: remplacer par un vrai appel CinetPay/PayDunya quand les accès seront prêts.

function processMockPayment({ method, phone, amount }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = true; // toujours succès en mode simulation
      resolve({
        success,
        payment_ref: `MOCK-${method.toUpperCase()}-${Date.now()}`,
        message: success
          ? `Paiement ${method} simulé avec succès`
          : "Paiement échoué",
      });
    }, 1200);
  });
}

module.exports = { processMockPayment };
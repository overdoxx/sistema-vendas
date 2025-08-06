const express = require("express")
const { requireAuth } = require("../middleware/auth")
const SalesService = require("../services/salesService")

const router = express.Router()

// Rota para a página de Top Vendedores
router.get("/", requireAuth, async (req, res) => {
  try {
    res.render("top-sellers/index", {
      title: "Top Vendedores",
      formatCurrency: SalesService.formatCurrency, // Passa a função de formatação
      currentPath: req.path, // Adicionado
    })
  } catch (error) {
    console.error("Erro ao carregar página de top vendedores:", error)
    res.status(500).send("Erro interno do servidor ao carregar top vendedores.")
  }
})

// Rota de API para obter os dados dos Top Vendedores (já existe no SalesService)
router.get("/api/data", requireAuth, async (req, res) => {
  try {
    const topSellersData = await SalesService.getTopSellersMonthly();
    res.json(topSellersData);
  } catch (error) {
    console.error("Erro ao obter top vendedores (API):", error);
    res.status(500).json({ error: "Erro interno do servidor ao obter top vendedores." });
  }
});

module.exports = router

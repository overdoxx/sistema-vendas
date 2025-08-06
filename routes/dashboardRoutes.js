const express = require("express")
const { requireAuth } = require("../middleware/auth")
const SalesService = require("../services/salesService")

const router = express.Router()

// Rota para a página do Dashboard (ainda renderiza EJS, mas os dados serão carregados via JS)
router.get("/", requireAuth, async (req, res) => {
  try {
    res.render("dashboard/index", {
      title: "Dashboard",
      // Não passamos mais os dados diretamente aqui, eles serão buscados via API no frontend
      // Apenas passamos a função de formatação de moeda, que pode ser útil no frontend
      formatCurrency: SalesService.formatCurrency,
      currentPath: req.path, // Adicionado
    })
  } catch (error) {
    console.error("Erro ao carregar página do dashboard:", error)
    res.status(500).send("Erro interno do servidor ao carregar dashboard.")
  }
})

// NOVA ROTA DE API: Retorna os dados do dashboard em JSON
router.get("/api/dashboard-data", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id

    const dailyData = await SalesService.getDailySales(userId)
    const monthlyData = await SalesService.getMonthlySales(userId)
    const last7Days = await SalesService.getLast7DaysSales(userId)
    const monthlyAnalytics = await SalesService.getMonthlyAnalytics(userId)
    const advancedAnalytics = await SalesService.getAdvancedAnalytics(userId)
    const topSellers = await SalesService.getTopSellersMonthly(); // NOVO: Dados dos top vendedores

    res.json({
      dailyData,
      monthlyData,
      last7Days,
      monthlyAnalytics,
      advancedAnalytics,
      topSellers, // Incluir os top vendedores
    })
  } catch (error) {
    console.error("Erro ao obter dados do dashboard (API):", error)
    res.status(500).json({ error: "Erro interno do servidor ao obter dados do dashboard." })
  }
})

module.exports = router

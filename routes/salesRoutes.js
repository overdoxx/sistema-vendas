const express = require("express")
const { requireAuth } = require("../middleware/auth")
const SalesService = require("../services/salesService")
const Sale = require("../models/Sale")

const router = express.Router()

// Adicionar nova venda (já retorna JSON, sem mudanças aqui)
router.post("/add", requireAuth, async (req, res) => {
  try {
    const { amount, date, description, type } = req.body
    const userId = req.session.user.id

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valor inválido" })
    }

    if (!date) {
      return res.status(400).json({ error: "Data é obrigatória" })
    }

    await SalesService.createSale(userId, Number.parseFloat(amount), date, description || "", type || "individual")

    res.json({ success: true, message: "Venda adicionada com sucesso!" })
  } catch (error) {
    console.error("Erro ao adicionar venda:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Histórico de vendas (agora pode retornar JSON ou renderizar EJS)
router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id
    const { startDate, endDate, fetchJson } = req.query // Adicionado fetchJson

    let sales = []
    let initialStartDate = null
    let initialEndDate = null

    if (startDate && endDate) {
      const parsedStartDate = new Date(`${startDate}T00:00:00.000Z`)
      const parsedEndDate = new Date(`${endDate}T23:59:59.999Z`)

      const combinedSales = await SalesService.getSalesForPeriod(userId, parsedStartDate, parsedEndDate)
      for (const dateKey in combinedSales) {
        sales.push(...combinedSales[dateKey].sales)
      }
      initialStartDate = startDate
      initialEndDate = endDate
    } else {
      const today = new Date()
      const defaultStartOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0))
      const defaultEndOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999))

      const combinedSales = await SalesService.getSalesForPeriod(userId, defaultStartOfMonth, defaultEndOfMonth)
      for (const dateKey in combinedSales) {
        sales.push(...combinedSales[dateKey].sales)
      }
      initialStartDate = defaultStartOfMonth.toISOString().split("T")[0]
      initialEndDate = defaultEndOfMonth.toISOString().split("T")[0]
    }

    sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    if (fetchJson === 'true') { // Se a requisição for para JSON
      return res.json({
        sales: sales.map(sale => ({
          ...sale.toObject(), // Converte o documento Mongoose para objeto JS puro
          dateFormatted: new Date(sale.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          createdAtTimeFormatted: new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          amountFormatted: SalesService.formatCurrency(sale.amount),
          commissionFormatted: SalesService.formatCurrency(sale.commission),
          typeDisplay: sale.type === 'daily_summary' ? 'Total Diário' : 'Individual',
          typeClass: sale.type === 'daily_summary' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white',
        })),
        selectedStartDate: initialStartDate,
        selectedEndDate: initialEndDate,
        totalAmount: sales.reduce((sum, sale) => sum + sale.amount, 0),
        totalCommission: sales.reduce((sum, sale) => sum + sale.commission, 0),
        totalCount: sales.length,
      });
    }

    // Caso contrário, renderiza a página EJS
    res.render("sales/history", {
      title: "Histórico de Vendas",
      sales, // Ainda passamos para a renderização inicial
      formatCurrency: SalesService.formatCurrency,
      selectedStartDate: initialStartDate,
      selectedEndDate: initialEndDate,
      currentPath: req.path, // Adicionado
    })
  } catch (error) {
    console.error("Erro no histórico:", error)
    res.status(500).send("Erro interno do servidor")
  }
})

// Rota para exibir formulário de edição de venda (ainda renderiza EJS)
router.get("/edit/:id", requireAuth, async (req, res) => {
  try {
    const saleId = req.params.id
    const sale = await SalesService.getSaleById(saleId)

    if (!sale || sale.userId.toString() !== req.session.user.id) {
      return res.status(404).send("Venda não encontrada ou não autorizada.")
    }

    res.render("sales/edit", {
      title: "Editar Venda",
      sale,
      formatCurrency: SalesService.formatCurrency,
      saleDate: sale.date.toISOString().split("T")[0],
      currentPath: req.path, // Adicionado
    })
  } catch (error) {
    console.error("Erro ao carregar venda para edição:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

// Rota para processar a edição de venda (já retorna JSON, sem mudanças aqui)
router.post("/edit/:id", requireAuth, async (req, res) => {
  try {
    const saleId = req.params.id
    const { amount, date, description, type } = req.body

    if (!amount || amount <= 0 || !date) {
      return res.status(400).json({ error: "Dados inválidos para atualização." })
    }

    const updatedSale = await SalesService.updateSale(
      saleId,
      Number.parseFloat(amount),
      date,
      description || "",
      type || "individual",
    )

    if (!updatedSale) {
      return res.status(404).json({ error: "Venda não encontrada ou não autorizada." })
    }

    res.json({ success: true, message: "Venda atualizada com sucesso!" })
  } catch (error) {
    console.error("Erro ao atualizar venda:", error)
    res.status(500).json({ error: "Erro interno do servidor." })
  }
})

// Rota para deletar venda (já retorna JSON, sem mudanças aqui)
router.post("/delete/:id", requireAuth, async (req, res) => {
  try {
    const saleId = req.params.id
    const sale = await SalesService.getSaleById(saleId)

    if (!sale || sale.userId.toString() !== req.session.user.id) {
      return res.status(404).json({ error: "Venda não encontrada ou não autorizada." })
    }

    await SalesService.deleteSale(saleId)
    res.json({ success: true, message: "Venda excluída com sucesso!" })
  } catch (error) {
    console.error("Erro ao deletar venda:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// NOVA ROTA DE API: Retorna os dados dos top vendedores em JSON
router.get("/api/top-sellers", requireAuth, async (req, res) => {
  try {
    const topSellersData = await SalesService.getTopSellersMonthly();
    res.json(topSellersData);
  } catch (error) {
    console.error("Erro ao obter top vendedores (API):", error);
    res.status(500).json({ error: "Erro interno do servidor ao obter top vendedores." });
  }
});

module.exports = router

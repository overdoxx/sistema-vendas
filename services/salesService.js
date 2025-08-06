const Sale = require("../models/Sale")
const User = require("../models/User")

class SalesService {
  static calculateCommission(amount) {
    return amount * 0.015 // 1.5%
  }

  // Helper para obter vendas de um período, priorizando daily_summary
  static async getSalesForPeriod(userId, startDate, endDate) {
    const dailySummaries = await Sale.find({
      userId,
      type: "daily_summary",
      date: { $gte: startDate, $lte: endDate },
    })

    const individualSales = await Sale.find({
      userId,
      type: "individual",
      date: { $gte: startDate, $lte: endDate },
    })

    // Agrupar vendas individuais por dia
    const individualSalesByDay = individualSales.reduce((acc, sale) => {
      const dateKey = new Date(sale.date).toISOString().split("T")[0]
      if (!acc[dateKey]) {
        acc[dateKey] = { sales: [], totalAmount: 0, totalCommission: 0, count: 0 }
      }
      acc[dateKey].sales.push(sale)
      acc[dateKey].totalAmount += sale.amount
      acc[dateKey].totalCommission += sale.commission
      acc[dateKey].count++
      return acc
    }, {})

    // Usar daily_summary se existir, senão usar soma das individuais
    const combinedSales = {}
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0]
      const summaryForDay = dailySummaries.find((s) => new Date(s.date).toISOString().split("T")[0] === dateKey)

      if (summaryForDay) {
        combinedSales[dateKey] = {
          sales: [summaryForDay], // Apenas a venda sumária
          totalAmount: summaryForDay.amount,
          totalCommission: summaryForDay.commission,
          count: 1, // Conta como 1 "venda" sumária
          type: "daily_summary",
        }
      } else if (individualSalesByDay[dateKey]) {
        combinedSales[dateKey] = {
          ...individualSalesByDay[dateKey],
          type: "individual",
        }
      } else {
        combinedSales[dateKey] = { sales: [], totalAmount: 0, totalCommission: 0, count: 0, type: "none" }
      }
      // Avança para o próximo dia, garantindo que a hora seja mantida para evitar loops infinitos ou pular dias
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    return combinedSales
  }

  // Novo método específico para gráficos que mostra TODOS os tipos de venda
  static async getSalesForChart(userId, startDate, endDate) {
    const dailySummaries = await Sale.find({
      userId,
      type: "daily_summary",
      date: { $gte: startDate, $lte: endDate },
    })

    const individualSales = await Sale.find({
      userId,
      type: "individual",
      date: { $gte: startDate, $lte: endDate },
    })

    // Agrupar vendas individuais por dia
    const individualSalesByDay = individualSales.reduce((acc, sale) => {
      const dateKey = new Date(sale.date).toISOString().split("T")[0]
      if (!acc[dateKey]) {
        acc[dateKey] = { sales: [], totalAmount: 0, totalCommission: 0, count: 0 }
      }
      acc[dateKey].sales.push(sale)
      acc[dateKey].totalAmount += sale.amount
      acc[dateKey].totalCommission += sale.commission
      acc[dateKey].count++
      return acc
    }, {})

    // Para gráficos, vamos mostrar AMBOS os tipos, mas sem duplicar
    const combinedSales = {}
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0]
      const summaryForDay = dailySummaries.find((s) => new Date(s.date).toISOString().split("T")[0] === dateKey)
      const individualsForDay = individualSalesByDay[dateKey]

      // Se existe Total Diário, usar ele. Senão, usar soma das individuais
      if (summaryForDay) {
        combinedSales[dateKey] = {
          sales: [summaryForDay],
          totalAmount: summaryForDay.amount,
          totalCommission: summaryForDay.commission,
          count: 1,
          type: "daily_summary",
          hasIndividuals: individualsForDay ? individualsForDay.count : 0, // Info adicional
        }
      } else if (individualsForDay) {
        combinedSales[dateKey] = {
          ...individualsForDay,
          type: "individual",
          hasIndividuals: individualsForDay.count,
        }
      } else {
        combinedSales[dateKey] = { 
          sales: [], 
          totalAmount: 0, 
          totalCommission: 0, 
          count: 0, 
          type: "none",
          hasIndividuals: 0,
        }
      }
      
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    return combinedSales
  }

  static async getDailySales(userId, date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0) // Usar setUTCHours para consistência com UTC

    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999) // Usar setUTCHours para consistência com UTC

    const combinedSales = await this.getSalesForPeriod(userId, startOfDay, endOfDay)
    const dateKey = startOfDay.toISOString().split("T")[0]
    return combinedSales[dateKey] || { sales: [], count: 0, totalAmount: 0, totalCommission: 0 }
  }

  static async getMonthlySales(userId, month = new Date().getMonth(), year = new Date().getFullYear()) {
    const startOfMonth = new Date(Date.UTC(year, month, 1))
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

    const combinedSales = await this.getSalesForPeriod(userId, startOfMonth, endOfMonth)

    let totalAmount = 0
    let totalCommission = 0
    let count = 0
    const salesList = []

    for (const dateKey in combinedSales) {
      totalAmount += combinedSales[dateKey].totalAmount
      totalCommission += combinedSales[dateKey].totalCommission
      count += combinedSales[dateKey].count
      salesList.push(...combinedSales[dateKey].sales) // Adiciona as vendas (individuais ou sumárias)
    }

    return {
      sales: salesList,
      count,
      totalAmount,
      totalCommission,
    }
  }

  static async getLast7DaysSales(userId) {
    const last7Days = []
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0) // Reset time to start of day for consistent comparison

    const startDate = new Date(today)
    startDate.setUTCDate(today.getUTCDate() - 6) // Start 6 days ago to include today

    // Usar o novo método que mostra todos os tipos de venda
    const combinedSales = await this.getSalesForChart(userId, startDate, today)

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setUTCDate(today.getUTCDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      const dailyData = combinedSales[dateKey] || { totalAmount: 0, totalCommission: 0, count: 0, type: "none" }

      last7Days.push({
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: 'UTC' }),
        amount: dailyData.totalAmount,
        count: dailyData.count,
        commission: dailyData.totalCommission,
        type: dailyData.type, // Adicionar info sobre o tipo para debug
        hasIndividuals: dailyData.hasIndividuals || 0, // Info adicional
      })
    }

    return last7Days
  }

  static async getMonthlyAnalytics(userId) {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Dados dos últimos 6 meses
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(Date.UTC(currentYear, currentMonth - i, 1)) // Criar data UTC
      const monthData = await this.getMonthlySales(userId, date.getUTCMonth(), date.getUTCFullYear()) // Usar UTC methods

      monthlyData.push({
        month: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit", timeZone: 'UTC' }), // Adicionado timeZone: 'UTC'
        amount: monthData.totalAmount,
        count: monthData.count,
        commission: monthData.totalCommission,
      })
    }

    return monthlyData
  }

  static async getAdvancedAnalytics(userId) {
    const user = await User.findById(userId)
    const currentMonthData = await this.getMonthlySales(userId)
    const previousMonthData = await this.getMonthlySales(userId, new Date().getMonth() - 1, new Date().getFullYear())

    // Crescimento mensal
    const growth =
      previousMonthData.totalAmount > 0
        ? ((currentMonthData.totalAmount - previousMonthData.totalAmount) / previousMonthData.totalAmount) * 100
        : 0

    // Progresso da meta
    const goalProgress = user.monthlyGoal > 0 ? (currentMonthData.totalAmount / user.monthlyGoal) * 100 : 0

    // Ticket médio
    const averageTicket = currentMonthData.count > 0 ? currentMonthData.totalAmount / currentMonthData.count : 0

    return {
      growth: Math.round(growth * 100) / 100,
      goalProgress: Math.min(Math.round(goalProgress * 100) / 100, 100),
      averageTicket,
      monthlyGoal: user.monthlyGoal,
    }
  }

  // NOVO MÉTODO: Obter Top Vendedores do Mês
  static async getTopSellersMonthly() {
    const today = new Date();
    const startOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999));

    const sales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$amount" },
          totalCommission: { $sum: "$commission" },
          salesCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users", // Nome da coleção de usuários no MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user", // Desestrutura o array 'user'
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: "$user.name",
          totalAmount: 1,
          totalCommission: 1,
          salesCount: 1,
        },
      },
      {
        $sort: { totalAmount: -1 }, // Ordena do maior para o menor
      },
    ]);

    let grandTotalSales = 0;
    sales.forEach(seller => {
      grandTotalSales += seller.totalAmount;
    });

    return { sellers: sales, grandTotalSales };
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  static async createSale(userId, amount, dateString, description = "", type = "individual") {
    const commission = this.calculateCommission(amount)

    // Criar a data de forma mais robusta para evitar problemas de fuso horário
    // Assumindo que dateString está no formato YYYY-MM-DD
    const dateParts = dateString.split("-")
    const year = parseInt(dateParts[0], 10)
    const month = parseInt(dateParts[1], 10) - 1 // Mês é 0-indexado
    const day = parseInt(dateParts[2], 10)
    
    // Criar a data explicitamente como UTC para evitar conversões de fuso horário
    const saleDate = new Date(Date.UTC(year, month, day, 12, 0, 0, 0)) // Usar meio-dia UTC para evitar problemas de borda

    console.log(`Criando venda: dateString=${dateString}, saleDate=${saleDate.toISOString()}`)

    // Se for uma venda diária total, remover vendas individuais existentes para aquele dia
    if (type === "daily_summary") {
      const startOfDay = new Date(saleDate)
      startOfDay.setUTCHours(0, 0, 0, 0)
      const endOfDay = new Date(saleDate)
      endOfDay.setUTCHours(23, 59, 59, 999)

      await Sale.deleteMany({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        type: "individual",
      })
      // Também remover qualquer daily_summary existente para o dia
      await Sale.deleteMany({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        type: "daily_summary",
      })
    }

    const sale = new Sale({
      userId,
      amount,
      commission,
      date: saleDate,
      description,
      type,
    })

    return await sale.save()
  }

  static async getSaleById(saleId) {
    return await Sale.findById(saleId)
  }

  static async updateSale(saleId, amount, dateString, description = "", type = "individual") {
    const commission = this.calculateCommission(amount)

    // Criar a data de forma mais robusta para evitar problemas de fuso horário
    const dateParts = dateString.split("-")
    const year = parseInt(dateParts[0], 10)
    const month = parseInt(dateParts[1], 10) - 1 // Mês é 0-indexado
    const day = parseInt(dateParts[2], 10)
    
    // Criar a data explicitamente como UTC para evitar conversões de fuso horário
    const saleDate = new Date(Date.UTC(year, month, day, 12, 0, 0, 0)) // Usar meio-dia UTC para evitar problemas de borda

    const originalSale = await Sale.findById(saleId)
    if (!originalSale) {
      throw new Error("Venda original não encontrada.")
    }

    // Se o tipo for alterado para daily_summary, remover individuais
    if (type === "daily_summary") {
      const startOfDay = new Date(saleDate)
      startOfDay.setUTCHours(0, 0, 0, 0)
      const endOfDay = new Date(saleDate)
      endOfDay.setUTCHours(23, 59, 59, 999)

      await Sale.deleteMany({
        userId: originalSale.userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        type: "individual",
        _id: { $ne: saleId }, // Não deletar a própria venda que está sendo atualizada
      })
      // Remover outras daily_summary para o dia
      await Sale.deleteMany({
        userId: originalSale.userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        type: "daily_summary",
        _id: { $ne: saleId },
      })
    }

    return await Sale.findByIdAndUpdate(
      saleId,
      { amount, commission, date: saleDate, description, type },
      { new: true }, // Retorna o documento atualizado
    )
  }

  static async deleteSale(saleId) {
    return await Sale.findByIdAndDelete(saleId)
  }
}

module.exports = SalesService

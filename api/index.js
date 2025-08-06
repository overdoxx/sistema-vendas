require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const path = require("path")

// Importar rotas (ajustando caminhos)
const authRoutes = require("../routes/authRoutes")
const dashboardRoutes = require("../routes/dashboardRoutes")
const salesRoutes = require("../routes/salesRoutes")
const topSellersRoutes = require("../routes/topSellersRoutes"); // NOVO: Importar rota de top vendedores

const app = express()

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado com sucesso"))
  .catch((err) => console.error("❌ Erro ao conectar MongoDB:", err))

// Configurar EJS - ajustar caminho das views
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "../views"))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configurar sessões
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sales-secret-key-2024-secure",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies em produção (HTTPS)
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adicionado SameSite
      httpOnly: true, // Boa prática de segurança
    },
    proxy: process.env.NODE_ENV === 'production', // Confiar no proxy reverso do Vercel em produção
  }),
)

// Middleware para disponibilizar usuário nas views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  next()
})

// Rotas
app.use("/auth", authRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/sales", salesRoutes)
app.use("/top-sellers", topSellersRoutes); // NOVO: Usar a rota de top vendedores

// Rota raiz
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard")
  }
  res.redirect("/auth/login")
})

// EXPORTAR O APP PARA O VERCEL (NÃO usar app.listen())
module.exports = app

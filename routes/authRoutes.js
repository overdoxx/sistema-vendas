const express = require("express")
const User = require("../models/User")
const { redirectIfAuth } = require("../middleware/auth")

const router = express.Router()

// Página de login
router.get("/login", redirectIfAuth, (req, res) => {
  res.render("auth/login", {
    title: "Login",
    error: null,
  })
})

// Processar login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.render("auth/login", {
        title: "Login",
        error: "Email ou senha inválidos",
      })
    }

    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.render("auth/login", {
        title: "Login",
        error: "Email ou senha inválidos",
      })
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    }

    res.redirect("/dashboard")
  } catch (error) {
    console.error("Erro no login:", error)
    res.render("auth/login", {
      title: "Login",
      error: "Erro interno do servidor",
    })
  }
})

// Página de registro
router.get("/register", redirectIfAuth, (req, res) => {
  res.render("auth/register", {
    title: "Cadastro",
    error: null,
  })
})

// Processar registro
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.render("auth/register", {
        title: "Cadastro",
        error: "Email já cadastrado",
      })
    }

    // Criar novo usuário
    const user = new User({ name, email, password })
    await user.save()

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    }

    res.redirect("/dashboard")
  } catch (error) {
    console.error("Erro no registro:", error)
    res.render("auth/register", {
      title: "Cadastro",
      error: "Erro ao criar conta",
    })
  }
})

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err)
    }
    res.redirect("/auth/login")
  })
})

module.exports = router

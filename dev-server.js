// Arquivo apenas para desenvolvimento local
const app = require('./api/index.js')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando na porta ${PORT}`)
  console.log(`🌐 Acesse: http://localhost:${PORT}`)
})

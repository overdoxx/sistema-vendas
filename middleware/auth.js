const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/login")
  }
  next()
}

const redirectIfAuth = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/dashboard")
  }
  next()
}

module.exports = {
  requireAuth,
  redirectIfAuth,
}

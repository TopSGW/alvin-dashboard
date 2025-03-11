module.exports = {
  apps: [{
    name: "admin-dashboard",
    script: "serve",
    env: {
      PM2_SERVE_PATH: './dist',
      PM2_SERVE_PORT: 5000,
      PM2_SERVE_SPA: 'true',
      PM2_SERVE_HOMEPAGE: '/index.html'
    }
  }]
}
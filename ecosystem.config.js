module.exports = {
  apps: [{
    name: "admin-dashboard",
    script: "npm",
    args: "run preview -- --port 3000",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
  }]
};
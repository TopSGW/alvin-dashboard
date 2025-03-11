module.exports = {
  apps: [{
    name: "admin-dashboard",
    script: "npm",
    args: "run preview",
    env: {
      NODE_ENV: "production",
    },
  }]
};
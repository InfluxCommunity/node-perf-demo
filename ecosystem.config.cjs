module.exports = {
  apps: [{
    name: "node-perf-demo",
    script: "server.js",
    watch: true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
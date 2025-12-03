module.exports = {
  apps: [
    {
      name: "watchapps-main",
      script: "npm",
      args: "run start -- -p 3000",
      cwd: "/var/www/watchapps/frontend",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "watchapps-dev",
      script: "npm",
      args: "run start -- -p 3001",
      cwd: "/var/www/watchapps/frontend",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};

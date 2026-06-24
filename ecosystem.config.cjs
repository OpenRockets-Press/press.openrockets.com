module.exports = {
  apps: [
    {
      name: "orp-api",
      script: "server/index.ts",
      interpreter: "bun",
      instances: 1, // Start with 1 instance on the VPS
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true
    }
  ]
};

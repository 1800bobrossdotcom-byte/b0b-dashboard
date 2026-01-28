module.exports = {
  apps: [
    {
      name: 'b0b-brain',
      script: 'brain.js',
      cwd: './brain',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      // Restart at 6am daily for clean state
      cron_restart: '0 6 * * *',
      // Log management
      error_file: './brain/logs/error.log',
      out_file: './brain/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
    {
      name: 'b0b-brain-api',
      script: 'brain-api.js',
      cwd: './brain',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        BRAIN_PORT: 3333,
      },
    },
    {
      name: 'b0b-trading',
      script: 'swarm-treasury.js',
      args: 'paper',
      cwd: './b0b-finance',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      // Don't restart automatically - brain controls this
      autorestart: false,
    },
    {
      name: 'd0t-web',
      script: 'npm',
      args: 'run dev',
      cwd: './d0t/web',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
    },
    {
      name: 'dashboard',
      script: 'npm',
      args: 'run dev',
      cwd: './dashboard',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
    },
  ],
};

module.exports = {
    apps: [{
      name: 'amore',
      script: 'npm',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: 'development',
        PORT: 8181,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8181,
      },
    }],
  };
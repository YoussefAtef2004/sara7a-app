import chalk from 'chalk';
import app from './app.js';
import config from './src/config/env.config.js';
import DBService from './src/services/db.service.js';


const startServer = async () => {
  try {
    console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.blue('  Sara7a Backend API'));
    console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log();

    await DBService.connect();
    console.log();

    const PORT = config.port;
    const server = app.listen(PORT, () => {
      console.log(chalk.green('✓ Server started successfully'));
      console.log(chalk.gray(`  Port: ${PORT}`));
      console.log(chalk.gray(`  Environment: ${config.env}`));
      console.log(chalk.gray(`  URL: http://localhost:${PORT}`));
      console.log();
      console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green('  Server is ready to accept connections'));
      console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();
    });

    const gracefulShutdown = async (signal) => {
      console.log();
      console.log(chalk.yellow(`⚠ ${signal} received. Starting graceful shutdown...`));
      
      server.close(async () => {
        console.log(chalk.blue('ℹ HTTP server closed'));
        
        try {
          await DBService.disconnect();
          console.log(chalk.green('✓ Graceful shutdown completed'));
          process.exit(0);
        } catch (error) {
          console.error(chalk.red('✗ Error during shutdown:'), error.message);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error(chalk.red('✗ Forced shutdown after timeout'));
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error(chalk.red('✗ Failed to start server:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
};


process.on('uncaughtException', (error) => {
  console.error(chalk.red('✗ Uncaught Exception:'), error.message);
  console.error(error.stack);
  process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('✗ Unhandled Rejection at:'), promise);
  console.error(chalk.red('  Reason:'), reason);
  process.exit(1);
});

startServer();

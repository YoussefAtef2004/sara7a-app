import mongoose from 'mongoose';
import chalk from 'chalk';

class DBService {
  static connection = null;
  static retryCount = 0;
  static maxRetries = 5;
  static retryDelay = 5000; 

  
  static async connect() {
    try {
      const uri = process.env.MONGODB_URI;
      
      if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      console.log(chalk.blue('ℹ Connecting to MongoDB...'));

      const options = {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      };

      this.connection = await mongoose.connect(uri, options);

      this.setupEventHandlers();

      console.log(chalk.green('✓ Database connected successfully'));
      console.log(chalk.gray(`  Host: ${this.connection.connection.host}`));
      console.log(chalk.gray(`  Database: ${this.connection.connection.name}`));
      
      this.retryCount = 0; 
      return this.connection;
    } catch (error) {
      console.error(chalk.red('✗ Database connection failed:'), error.message);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
        
        console.log(chalk.yellow(`⚠ Retrying connection in ${delay / 1000} seconds... (Attempt ${this.retryCount}/${this.maxRetries})`));
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connect();
      } else {
        console.error(chalk.red('✗ Max retry attempts reached. Exiting...'));
        throw error;
      }
    }
  }

 
  static setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      console.log(chalk.green('✓ Mongoose connected to MongoDB'));
    });

    mongoose.connection.on('error', (err) => {
      console.error(chalk.red('✗ Mongoose connection error:'), err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(chalk.yellow('⚠ Mongoose disconnected from MongoDB'));
    });

    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  
  static async disconnect() {
    try {
      await mongoose.connection.close();
      console.log(chalk.blue('ℹ Database connection closed'));
    } catch (error) {
      console.error(chalk.red('✗ Error closing database connection:'), error.message);
      throw error;
    }
  }

  
  static getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const state = mongoose.connection.readyState;
    return {
      state: states[state],
      stateCode: state,
      isConnected: state === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

export default DBService;

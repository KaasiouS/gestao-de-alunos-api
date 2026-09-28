import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Carrega o .env antes de qualquer arquivo de teste importar a aplicação,
// garantindo que MONGODB_URI e as credenciais estejam disponíveis em process.env.
dotenv.config({ quiet: true });

export const mochaHooks = {
  async afterAll() {
    await mongoose.connection.close();
  },
};

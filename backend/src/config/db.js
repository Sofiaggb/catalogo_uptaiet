import { Pool } from 'pg';

//  conexión a PostgreSQL
export const pool = new Pool({
  user:  process.env.DB_USER,    
  host: process.env.DB_IP,
  database: process.env.DB_NAME,
  password:  process.env.DB_PASWORD,
  port: 5432,
});

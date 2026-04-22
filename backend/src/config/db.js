import { Pool } from 'pg';

//  conexión a PostgreSQL
export const pool = new Pool({
  user: 'postgres',    
  host: 'localhost',
  database: 'catalogo_uptaiet',
  password: 'sofia123',
  port: 5432,
});

/**
 * Creates the database (if missing) and applies schema.sql.
 * Run with: npm run db:init
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { config } = require('./pool');

async function main() {
  const { database, ...serverConfig } = config;

  const connection = await mysql.createConnection({
    ...serverConfig,
    multipleStatements: true,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.changeUser({ database });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);

  console.log(`Database "${database}" is ready, tasks table applied.`);
  await connection.end();
}

main().catch((err) => {
  console.error('Database setup failed:', err.message);
  process.exit(1);
});

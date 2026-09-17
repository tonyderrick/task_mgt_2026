/**
 * Inserts a handful of sample tasks so the UI is not empty on first run.
 * Run with: npm run db:seed
 */
const { pool } = require('./pool');

const samples = [
  ['Submit kLab challenge', 'Push the repo and fill in the submission form.', 'pending', 'high'],
  ['Write API documentation', 'Document every endpoint with request and response examples.', 'pending', 'medium'],
  ['Set up MySQL locally', 'Create the database and run the schema script.', 'completed', 'high'],
  ['Design the task list screen', 'Priority spine, inline editing, keyboard focus states.', 'completed', 'low'],
  ['Add search and filters', 'Search by title or description, filter by status and priority.', 'pending', 'medium'],
];

async function main() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM tasks');
  if (rows[0].count > 0) {
    console.log('Tasks table already has data, skipping seed.');
    await pool.end();
    return;
  }

  await pool.query(
    'INSERT INTO tasks (title, description, status, priority) VALUES ?',
    [samples]
  );

  console.log(`Inserted ${samples.length} sample tasks.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await pool.end();
  process.exit(1);
});

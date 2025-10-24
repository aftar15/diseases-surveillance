const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// Register ts-node to handle TypeScript imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
  },
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Run database migrations
async function setupDatabase() {
  console.log('Setting up database...');
  try {
    // Import and run migrations directly from TypeScript
    const { runMigrations } = require('./src/lib/db/migrations');
    const success = await runMigrations();
    
    if (!success) {
      console.error('Database migration failed. Starting server anyway...');
    } else {
      console.log('Database migration completed successfully.');
    }
  } catch (error) {
    console.error('Failed to run database migrations:', error);
    console.log('Starting server without database migrations...');
  }
}

app.prepare().then(async () => {
  // Set up database before starting the server
  await setupDatabase();
  
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  // Import and initialize the socket server directly from TypeScript
  const { initSocketServer } = require('./src/lib/socket-server');
  initSocketServer(server);
  
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for frontend integration
app.use('/*', cors());

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Hello endpoint
app.get('/api/hello', (c) => {
  return c.json({
    message: 'Hello from HonoJS Turborepo',
  });
});

// Info endpoint
app.get('/api/info', (c) => {
  return c.json({
    appName: 'HonoJS Backend',
    framework: 'HonoJS',
    apiEndpoint: process.env.API_ENDPOINT || 'http://localhost:3001',
    deployedOn: process.env.DEPLOYED_ON || 'local',
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
  });
});

// Default route
app.get('/', (c) => {
  return c.json({
    message: 'HonoJS Backend API',
    endpoints: ['/api/health', '/api/hello', '/api/info'],
  });
});

const port = process.env.PORT || 3001;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});

export default app;

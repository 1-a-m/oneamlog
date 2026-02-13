import { Hono } from 'hono';
import { cors } from 'hono/cors';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import apiRoutes from './routes/api';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', cors());

// Routes
app.route('/', publicRoutes);
app.route('/admin', adminRoutes);
app.route('/api', apiRoutes);

// 404 handler
app.notFound((c) => {
  return c.text('404 Not Found', 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.text('Internal Server Error', 500);
});

export default app;

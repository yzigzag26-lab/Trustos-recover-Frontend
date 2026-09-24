import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createLocalAuthHandler } from './server/localAuth.mjs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'trustos-local-auth-api',
      configureServer(server) {
        const handle = createLocalAuthHandler();
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/api/')) return next();
          void handle(req, res).catch(() => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ error: 'Local service unavailable.', code: 'SERVER_ERROR' }));
            }
          });
        });
      },
    },
  ],
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
});

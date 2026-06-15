import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import app from './app.js';

// Local / single-port runner: serves the built frontend (web/dist) and the API
// together. On Vercel the API runs as a serverless function and the static
// frontend is served by the platform, so this file is not used there.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, '../../web/dist');

if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) =>
    res.json({
      message: 'Mentoria Hub API работает. Соберите фронтенд: `npm run build`.',
    })
  );
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n  Mentoria Hub server → http://localhost:${PORT}\n`);
});

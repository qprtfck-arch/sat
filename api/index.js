// Vercel serverless entrypoint — exposes the Express app as a function handler.
// vercel.json rewrites /api/(.*) to this function; Express handles the routing.
import app from '../server/src/app.js';

export default app;

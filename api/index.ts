import '../server/env.js';
import express, { Request, Response } from 'express';
import { apiRouter } from '../server/routes.js';

const app = express();

// Raise body size limit to 10 MB to support PVC image uploads (base64-encoded images ~5 MB raw = ~7 MB base64)
app.use(express.json({ limit: '10mb', verify: (req, _res, buffer) => {
    (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
  } }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({ status: 'ok', server: 'vercel-serverless', time: new Date().toISOString() });
});

// Mount router on both /api and root /
// In Vercel serverless rewrites, req.url might arrive as /api/... or /...
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;

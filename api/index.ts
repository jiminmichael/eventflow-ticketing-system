import 'dotenv/config';
import express, { Request, Response } from 'express';
import { apiRouter } from '../server/routes.js';

const app = express();

app.use(express.json({ limit: '1mb', verify: (req, _res, buffer) => {
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

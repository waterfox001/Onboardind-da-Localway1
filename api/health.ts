import type { Request, Response } from 'express';
import app from '../src/serverApp';

export default function handler(req: Request, res: Response) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/health';
  } else if (!req.url.startsWith('/api/health') && !req.url.startsWith('/health')) {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = '/api/health' + query;
  }
  return app(req, res);
}

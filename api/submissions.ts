import type { Request, Response } from 'express';
import app from '../src/serverApp';

export default function handler(req: Request, res: Response) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/submissions';
  } else if (!req.url.startsWith('/api/submissions') && !req.url.startsWith('/submissions')) {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = '/api/submissions' + query;
  }
  return app(req, res);
}

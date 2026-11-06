import type { Request, Response } from 'express';
import app from '../src/serverApp';

export default function handler(req: Request, res: Response) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/submit-onboarding';
  } else if (!req.url.startsWith('/api/submit-onboarding') && !req.url.startsWith('/submit-onboarding')) {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = '/api/submit-onboarding' + query;
  }
  return app(req, res);
}

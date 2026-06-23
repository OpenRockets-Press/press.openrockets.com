import { describe, it, expect } from 'vitest';
import { app } from '../index';

describe('End-to-End API Routing & Database Health', () => {
  it('should return 200 OK from the /api/health endpoint', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.message).toBe('Open Rockets Press API is running');
  });

  it('should return 404 for unknown API routes', async () => {
    const res = await app.request('/api/unknown-endpoint-testing');
    expect(res.status).toBe(404);
    
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('should enforce application/json on POST requests', async () => {
    const res = await app.request('/api/publications', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: 'mock data'
    });
    
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('should return 401 Unauthorized for missing CRON token', async () => {
    const res = await app.request('/api/cron/cleanup', {
      method: 'POST'
    });
    
    expect(res.status).toBe(415); // Wait, Content-Type validation runs before CRON logic!
    
    const resCorrect = await app.request('/api/cron/cleanup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(resCorrect.status).toBe(401);
    const bodyCorrect = await resCorrect.json();
    expect(bodyCorrect.error.code).toBe('UNAUTHORIZED');
  });
});

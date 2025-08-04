import { handle } from 'hono/cloudflare-pages';
import app from '../../src/worker/index';

export const onRequest = handle(app);
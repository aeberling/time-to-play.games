# Deployment & DevOps Strategy

## Overview

Time to Play is deployed on Kinsta Application Hosting with managed PostgreSQL and Redis services. This document covers the complete deployment pipeline, infrastructure setup, monitoring, and maintenance procedures.

## Hosting Architecture

### Kinsta Application Hosting

**Why Kinsta?**
- Excellent performance (Cloudflare CDN built-in)
- Git-based deployments (automatic on push)
- Easy environment variable management
- Built-in SSL certificates
- Great Node.js support
- Reasonable pricing for small scale

**Configuration**:
- **Region**: US Central (can expand to multiple regions later)
- **Instance Type**: Hobby (suitable for 10-100 concurrent users)
- **Auto-scaling**: Not needed initially (Hobby plan sufficient)

### Database: PostgreSQL

**Provider Options**:
1. **Neon** (Recommended)
   - Serverless PostgreSQL
   - Automatic scaling
   - Branching (great for preview deployments)
   - Free tier available
   - Built-in connection pooling

2. **Supabase**
   - PostgreSQL + real-time subscriptions
   - Built-in auth (we won't use it)
   - Generous free tier
   - Automatic backups

3. **Kinsta Managed Database**
   - If using Kinsta for everything
   - Good performance
   - Higher cost

**Recommended**: Neon for its branching feature and serverless model

### Cache: Redis

**Provider Options**:
1. **Upstash** (Recommended)
   - Serverless Redis
   - Pay per request
   - Global replication
   - REST API (works in edge functions)
   - Free tier: 10,000 commands/day

2. **Redis Cloud**
   - Traditional Redis
   - Fixed pricing
   - High performance
   - 30MB free tier

**Recommended**: Upstash for its serverless model and generous free tier

### File Storage

**For card graphics and assets**:
- **Option 1**: Kinsta's built-in storage (simple, same provider)
- **Option 2**: AWS S3 + CloudFront (more control, lower cost at scale)
- **Option 3**: Cloudflare R2 (S3-compatible, no egress fees)

**Recommended**: Start with Kinsta storage, migrate to R2 if needed

## Environment Configuration

### Environment Variables

```bash
# .env.production

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://time-to-play.games
NEXT_PUBLIC_WS_URL=wss://time-to-play.games

# Database (Neon)
DATABASE_URL=postgresql://user:pass@region.neon.tech/dbname?sslmode=require

# Redis (Upstash)
REDIS_URL=https://region.upstash.io
REDIS_TOKEN=your_token_here

# Authentication
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>

# CORS
ALLOWED_ORIGINS=https://time-to-play.games,https://www.time-to-play.games

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Email (for password reset)
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@time-to-play.games

# File Storage (if using S3/R2)
S3_BUCKET=time-to-play-assets
S3_REGION=auto
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx

# Rate Limiting
RATE_LIMIT_ENABLED=true
```

### Development Environment

```bash
# .env.local

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/timetoplay
REDIS_URL=redis://localhost:6379

JWT_SECRET=dev_secret_key
JWT_REFRESH_SECRET=dev_refresh_key

ALLOWED_ORIGINS=http://localhost:3000
```

## Deployment Pipeline

### Git Workflow

```
main branch (production)
  ↑
  └── develop branch (staging)
       ↑
       └── feature/* branches
```

### Kinsta Deployment Setup

1. **Connect GitHub Repository**
   - Link repository to Kinsta
   - Set main branch for production
   - Optional: Set develop branch for staging environment

2. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "startCommand": "npm run start",
     "nodeVersion": "20",
     "installCommand": "npm ci"
   }
   ```

3. **Automatic Deployments**
   - Push to main → automatic production deploy
   - Push to develop → automatic staging deploy
   - Pull requests → preview deployments (optional)

### Database Migrations

**Running migrations on deploy**:

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "node server.js",
    "migrate": "prisma migrate deploy"
  }
}
```

**Important**: Use `prisma migrate deploy` (not `prisma migrate dev`) in production

### WebSocket Server Setup

Kinsta supports long-running WebSocket connections. The WebSocket server runs alongside Next.js:

```javascript
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { setupSocketHandlers } = require('./src/server/socket');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  // Socket.io setup
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    }
  });

  setupSocketHandlers(io);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Setup database
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          npx prisma migrate deploy
          npx prisma db seed

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
        run: npm run test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to Kinsta
        run: echo "Deployment handled by Kinsta's GitHub integration"
        # Kinsta automatically deploys on push to main
```

## Monitoring & Observability

### Error Tracking: Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Adjust in production
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true
    })
  ]
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // Sample 10% in production
});
```

### Logging

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// In production, add external logging service
if (process.env.NODE_ENV === 'production') {
  // Example: Logtail, Datadog, etc.
}
```

### Uptime Monitoring

**Options**:
1. **UptimeRobot** (Free)
   - 50 monitors on free tier
   - 5-minute check intervals
   - Email/SMS alerts

2. **Pingdom** (Paid)
   - More detailed checks
   - Real user monitoring
   - Performance insights

3. **Checkly** (Modern, API-focused)
   - Playwright-based checks
   - Check complex flows
   - Generous free tier

**Recommended**: UptimeRobot for simple uptime, upgrade to Checkly for complex checks

### Application Metrics

```typescript
// lib/metrics.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function trackMetric(metric: string, value: number = 1) {
  const key = `metrics:${metric}:${new Date().toISOString().split('T')[0]}`;
  await redis.incrby(key, value);
  await redis.expire(key, 86400 * 30); // Keep for 30 days
}

// Usage
await trackMetric('games_created');
await trackMetric('games_completed');
await trackMetric('player_joins');
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = { status: 'healthy' };
  } catch (error) {
    checks.checks.database = { status: 'unhealthy', error: error.message };
    checks.status = 'unhealthy';
  }

  // Check Redis
  try {
    await redis.ping();
    checks.checks.redis = { status: 'healthy' };
  } catch (error) {
    checks.checks.redis = { status: 'unhealthy', error: error.message };
    checks.status = 'unhealthy';
  }

  // Check active games count
  try {
    const activeGames = await redis.zcard('games:active');
    checks.checks.activeGames = { count: activeGames };
  } catch (error) {
    checks.checks.activeGames = { error: error.message };
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  return Response.json(checks, { status: statusCode });
}
```

## Performance Optimization

### CDN & Caching

Kinsta includes Cloudflare CDN. Configure caching headers:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/cards/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### Database Optimization

```typescript
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"] // Faster queries
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL") // For migrations
}
```

**Connection pooling**:
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Redis Optimization

```typescript
// Use pipelining for batch operations
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.set('key3', 'value3');
await pipeline.exec();

// Use Lua scripts for atomic operations
const script = `
  local value = redis.call('GET', KEYS[1])
  redis.call('SET', KEYS[1], value + 1)
  return value
`;
await redis.eval(script, ['counter']);
```

## Backup & Recovery

### Database Backups

**Neon**: Automatic daily backups, 7-day retention (free tier)

**Manual backup script**:
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3/R2
aws s3 cp ${BACKUP_FILE}.gz s3://backups/database/

# Clean up
rm ${BACKUP_FILE}.gz

echo "Backup completed: ${BACKUP_FILE}.gz"
```

Run weekly via cron:
```
0 3 * * 0 /path/to/backup-db.sh
```

### Disaster Recovery Plan

1. **Database Failure**:
   - Restore from Neon automatic backup
   - Or restore from manual backup
   - Update DATABASE_URL if switching providers

2. **Redis Failure**:
   - Redis data is ephemeral (active games only)
   - Reconstruct from PostgreSQL using game moves
   - Players will need to reconnect

3. **Complete Outage**:
   - Kinsta backup: Restore entire application
   - Database: Restore from backup
   - Redis: Empty (will rebuild from DB)
   - Estimated recovery time: 15-30 minutes

## Security Hardening

### Environment Security

```typescript
// Validate environment variables at startup
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test'])
});

envSchema.parse(process.env);
```

### Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1m'),
  analytics: true
});

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, pending, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  return NextResponse.next();
}
```

### Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

## Maintenance

### Regular Tasks

**Daily**:
- Check error logs in Sentry
- Monitor uptime status
- Review active games count

**Weekly**:
- Review database size and growth
- Check Redis memory usage
- Analyze slow queries
- Review user feedback

**Monthly**:
- Update dependencies: `npm outdated`
- Review and update security patches
- Database maintenance: `VACUUM ANALYZE`
- Review costs and optimize

### Scaling Plan

**When to scale**:
- Response times > 500ms consistently
- CPU usage > 80% sustained
- Active games > 50 concurrent
- Database connections near limit

**Scaling steps**:
1. Upgrade Kinsta instance (Hobby → Starter → Business)
2. Add Redis replicas (read replicas)
3. Add database read replicas
4. Consider multi-region deployment

---

This deployment strategy provides a solid foundation for launching Time to Play with room to grow as the user base expands.

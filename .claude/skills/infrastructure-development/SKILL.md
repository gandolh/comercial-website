---
name: infrastructure-development
description: Use when working on local dev infrastructure (docker-compose, migrations, env setup) or production AWS infrastructure (CDK, ECS Fargate, Dockerfiles) for my-olx digital-assets marketplace
---

# DevOps & Infrastructure — my-olx

## Structure

```
infrastructure/my-olx-local/     ← docker-compose (Postgres, LocalStack, MailHog)
cdk/                             ← AWS CDK TypeScript stacks (dev + prod)
backend/migrations/              ← raw .sql migration files
backend/Dockerfile               ← multi-stage Node build
frontend/Dockerfile              ← multi-stage Node build → nginx
```

---

## Local Development

### Services (docker-compose)

All local services live in `infrastructure/my-olx-local/docker-compose.yml`:

- PostgreSQL 16 — primary database
- LocalStack 3 — S3 emulation (`my-olx-uploads` bucket)
- MailHog — local email testing (SMTP on 1025, Web UI on 8025)

```bash
cd infrastructure/my-olx-local
docker-compose up -d      # start all services
docker-compose down       # stop (data persists in named volumes)
docker-compose down -v    # stop + wipe volumes (clean slate)
```

### Adding a new local service

1. Add the service block to `infrastructure/local/docker-compose.yml`
2. Add health check (`healthcheck:` block) — required so dependent services wait correctly
3. If it needs init scripts, add them under `infrastructure/local/<service>/`
4. Update `infrastructure/local/.env.example` with any new env vars
5. Update `backend/.env.example` to match

### Database Migrations

Migrations always run against local Postgres (or RDS in production). Raw `.sql` files in `backend/migrations/` run in lexicographic order via custom migrator. **Always create the migration before writing TypeScript code**.

```bash
# From backend/, manually create file (no CLI helper yet)
touch migrations/001_create_users_table.sql
```

Migration file structure:

```sql
-- UP
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DOWN
DROP TABLE users;
```

Apply migrations before running the backend:

```bash
cd infrastructure/my-olx-local && docker-compose up -d
cd backend && npm run migrate && npm run dev
```

Migrations are tracked in `_migrations` table; pending migrations auto-run on `npm run migrate`.

---

## Dockerfiles

### Backend (`backend/Dockerfile`) — multi-stage Node

```dockerfile
# Stage 1: dependencies
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: runtime
FROM node:22-alpine
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/core/dist ./core/dist
COPY --from=builder /app/app/dist ./app/dist
COPY --from=builder /app/migrations ./migrations
COPY package.json ./
EXPOSE 8080
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### Frontend (`frontend/Dockerfile`) — multi-stage Node → nginx

```dockerfile
# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`frontend/nginx.conf` — SPA routing + API proxy:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://backend:8080/;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## AWS CDK (`cdk/`)

### Stack layout

```
cdk/
  bin/
    app.ts              ← entry point, instantiates dev + prod stacks
  lib/
    my-olx-stack.ts     ← main stack (ECS, RDS, ElastiCache, S3, ECR, Secrets)
  cdk.json
  package.json
  tsconfig.json
```

### Two environments — always

```typescript
// bin/app.ts
new MyOlxStack(app, "MyOlxDev", {
  env: { account: process.env.CDK_ACCOUNT, region: "eu-central-1" },
  envName: "dev",
  rdsInstanceType: ec2.InstanceType.of(
    ec2.InstanceClass.T3,
    ec2.InstanceSize.MICRO,
  ),
  taskCpu: 256,
  taskMemory: 512,
});

new MyOlxStack(app, "MyOlxProd", {
  env: { account: process.env.CDK_ACCOUNT, region: "eu-central-1" },
  envName: "prod",
  rdsInstanceType: ec2.InstanceType.of(
    ec2.InstanceClass.T3,
    ec2.InstanceSize.SMALL,
  ),
  taskCpu: 512,
  taskMemory: 1024,
});
```

### AWS Services to wire

| Service             | Purpose              | Notes                                  |
| ------------------- | -------------------- | -------------------------------------- |
| ECR                 | Container registry   | One repo per image (backend, frontend) |
| ECS Fargate         | Compute              | Task definition per service            |
| RDS Postgres 16     | Database             | Single-AZ for dev, Multi-AZ for prod   |
| ElastiCache Redis 7 | Cache/sessions       | Single node for dev, cluster for prod  |
| S3                  | File uploads         | Bucket per environment                 |
| Secrets Manager     | All secrets/env vars | Never put secrets in task definitions  |

### Secrets Manager — rule

**Never** pass secrets (DB password, JWT secret, Redis URL with auth) as plain ECS environment variables. Always:

1. Store in AWS Secrets Manager
2. Reference via `ecs.Secret.fromSecretsManager(secret, 'field')` in task definitions
3. Grant task role `secretsmanager:GetSecretValue` on those secrets only

### CDK commands

```bash
cd cdk
npm install
npx cdk diff MyOlxDev      # preview changes
npx cdk deploy MyOlxDev    # deploy dev stack
npx cdk deploy MyOlxProd   # deploy prod stack
npx cdk destroy MyOlxDev   # tear down dev stack
```

### Checklist — new AWS resource

- [ ] Added to the correct stack (dev + prod with appropriate sizing)
- [ ] Secrets stored in Secrets Manager, not task env vars
- [ ] Task IAM role granted least-privilege access to new resource
- [ ] Resource tagged with `envName` for cost tracking

---

## Checklist — new local service

- [ ] Service added to `infrastructure/my-olx-local/docker-compose.yml` with health check
- [ ] Init scripts added to `infrastructure/my-olx-local/<service>/` if needed
- [ ] `infrastructure/my-olx-local/.env.example` updated (if applicable)
- [ ] `backend/.env.example` updated to match
- [ ] Corresponding AWS CDK resource planned for production

## Checklist — new migration

- [ ] Migration created manually as `backend/migrations/{timestamp}_{description}.sql`
- [ ] UP SQL written (creates/alters schema)
- [ ] DOWN SQL written (drops/reverts)
- [ ] `npm run migrate` executed against local Postgres to verify
- [ ] `npm run build` passes (TypeScript compile-check)

# Deployment Guide: Running AcademicFlow Outside Replit

This guide provides step-by-step instructions for deploying the AcademicFlow application to external hosting platforms outside of Replit.

## Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Prerequisites](#prerequisites)
3. [Database Migration](#database-migration)
4. [Environment Variables & Secrets](#environment-variables--secrets)
5. [Dependencies Installation](#dependencies-installation)
6. [Deployment Options](#deployment-options)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Project Structure Overview

AcademicFlow is a full-stack TypeScript application with the following architecture:

```
academicflow/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components (shadcn/ui)
│   │   ├── pages/           # Application pages (Wouter routes)
│   │   ├── lib/             # Utilities and configurations
│   │   ├── hooks/           # Custom React hooks
│   │   ├── App.tsx          # Main app component with routing
│   │   └── main.tsx         # Application entry point
│   └── index.html           # HTML template
├── server/                   # Backend Express.js server
│   ├── lib/                 # Server utilities (S3, etc.)
│   ├── types/               # TypeScript type definitions
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data storage interface
│   ├── db.ts                # Database connection
│   └── vite.ts              # Vite middleware for development
├── shared/                   # Shared types between frontend and backend
│   └── schema.ts            # Database schema and types
├── migrations/              # Database migration files
├── package.json             # Dependencies and scripts
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
└── drizzle.config.ts       # Drizzle ORM configuration
```

### Key Technologies

- **Frontend:** React 18, TypeScript, Vite, Wouter (routing), TanStack Query, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **File Storage:** AWS S3
- **AI Services:** OpenAI API
- **Build System:** Vite (frontend), ESBuild (backend)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js 20+** installed locally
- **PostgreSQL database** (we'll cover setup options below)
- **AWS S3 bucket** for file storage (or compatible S3 service)
- **OpenAI API key** for AI features
- **Git** installed for version control
- Basic command line knowledge

---

## Database Migration

### Current Setup in Replit

In Replit, you're using a **Neon PostgreSQL serverless database** with automatic environment variables:
- `DATABASE_URL` - Full connection string
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` - Individual components

### External Database Options

Choose one of these PostgreSQL hosting providers:

#### Option 1: Neon (Recommended - Same as Replit)

Neon provides serverless PostgreSQL with a generous free tier.

**Setup Steps:**

1. **Sign up:** Visit [neon.tech](https://neon.tech) and create an account
2. **Create a project:** Click "Create Project"
3. **Get credentials:** Copy the connection string (format: `postgresql://user:password@host/database?sslmode=require`)
4. **Save for later:** You'll use this as `DATABASE_URL` in environment variables

**Pricing:** Free tier includes 0.5 GB storage, sufficient for development

#### Option 2: Supabase

Supabase offers PostgreSQL with additional features like auth and storage.

**Setup Steps:**

1. **Sign up:** Visit [supabase.com](https://supabase.com) and create account
2. **Create project:** New Project → Choose region → Set database password
3. **Get connection string:** Project Settings → Database → Connection String → URI
4. **Connection pooling:** For serverless deployments, use the "Connection pooling" string with `?pgbouncer=true`

**Pricing:** Free tier includes 500 MB database storage

#### Option 3: Railway

Railway provides PostgreSQL with simple deployment integration.

**Setup Steps:**

1. **Sign up:** Visit [railway.app](https://railway.app)
2. **Create project:** Dashboard → New Project → Provision PostgreSQL
3. **Get credentials:** Click the PostgreSQL service → Variables tab → Copy `DATABASE_URL`

**Pricing:** $5/month for 1 GB database

#### Option 4: AWS RDS

For production workloads requiring high availability.

**Setup Steps:**

1. **AWS Console:** Navigate to RDS → Create database
2. **Engine:** Select PostgreSQL (latest version)
3. **Template:** Choose "Free tier" or "Production" based on needs
4. **Settings:** Set DB instance identifier, master username, password
5. **Connectivity:** Enable public access if deploying from external platform
6. **Security group:** Add inbound rule for PostgreSQL (port 5432) from your IP
7. **Get endpoint:** After creation, copy the endpoint hostname
8. **Construct URL:** `postgresql://username:password@endpoint:5432/database_name`

**Pricing:** Free tier available for 12 months (limited to db.t2.micro)

#### Option 5: Self-Hosted PostgreSQL

For full control, host on your own VPS (DigitalOcean, Linode, etc.)

**Setup Steps (Ubuntu example):**

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE academicflow;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE academicflow TO your_username;
\q

# Allow remote connections (edit postgresql.conf)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Change: listen_addresses = '*'

# Configure authentication (edit pg_hba.conf)
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Migrating Your Existing Data

If you have existing data in Replit's database:

#### Method 1: PostgreSQL Dump (Recommended)

```bash
# On Replit (or locally with Replit database credentials)
pg_dump $DATABASE_URL > backup.sql

# On new database server
psql $NEW_DATABASE_URL < backup.sql
```

#### Method 2: Drizzle Studio Export/Import

1. In Replit, run: `npx drizzle-kit studio`
2. Export data from tables manually (CSV/JSON)
3. Import into new database using Drizzle Studio

#### Method 3: Fresh Start with Schema Only

If you don't need existing data:

```bash
# On your new deployment (after setting DATABASE_URL)
npm run db:push
```

This creates all tables with the current schema without any data.

---

## Environment Variables & Secrets

### Required Environment Variables

The application requires these environment variables:

#### 1. Database Connection

```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

Get this from your chosen database provider (see Database Migration section above).

#### 2. AWS S3 Configuration

For PDF file storage feature:

```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

**Setup Steps:**

1. **Create AWS account:** Visit [aws.amazon.com](https://aws.amazon.com)
2. **Create S3 bucket:**
   - Go to S3 console → Create bucket
   - Choose unique name (e.g., `academicflow-pdfs`)
   - Select region (e.g., `us-east-1`)
   - Uncheck "Block all public access" (we use signed URLs for security)
   - Create bucket
3. **Create IAM user:**
   - Go to IAM console → Users → Create user
   - User name: `academicflow-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
4. **Generate access keys:**
   - Select user → Security credentials → Create access key
   - Use case: "Application running outside AWS"
   - Save Access Key ID and Secret Access Key (shown only once!)

**S3 Alternatives (Compatible):**
- **Cloudflare R2:** S3-compatible, cheaper egress
- **DigitalOcean Spaces:** S3-compatible API
- **MinIO:** Self-hosted S3-compatible storage

#### 3. OpenAI API Key

For AI features (text improvement, detection, citations):

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup Steps:**

1. **Create account:** Visit [platform.openai.com](https://platform.openai.com)
2. **Add payment method:** Billing → Payment methods (required for API access)
3. **Generate API key:** API keys → Create new secret key
4. **Copy and save:** Key shown only once, starts with `sk-proj-` or `sk-`

**Pricing:** Pay-as-you-go, approximately $0.002/1K tokens (GPT-4o)

#### 4. Session Secret (Production)

For secure session cookies:

```bash
SESSION_SECRET=your-random-secret-key-min-32-characters
```

**Generate a secure secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. Optional: Clerk Authentication

If implementing Clerk auth (see `CLERK_AUTH_GUIDE.md`):

```bash
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Setting Environment Variables by Platform

#### For Vercel:

```bash
vercel env add DATABASE_URL
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION
vercel env add AWS_S3_BUCKET_NAME
vercel env add OPENAI_API_KEY
vercel env add SESSION_SECRET
```

Or via dashboard: Project Settings → Environment Variables

#### For Render:

Dashboard → Environment → Add Environment Variable for each

#### For Railway:

Dashboard → Project → Variables → Add variable for each

#### For AWS/DigitalOcean/Custom VPS:

Create `.env` file (DO NOT commit to git):

```bash
# .env
DATABASE_URL=postgresql://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=...
OPENAI_API_KEY=...
SESSION_SECRET=...
```

Then use a process manager like PM2 or systemd to load environment variables.

### Security Best Practices

1. **Never commit secrets to git:** Add `.env` to `.gitignore` (already done)
2. **Use different keys for dev/staging/production:** Prevents accidental data mixing
3. **Rotate keys periodically:** Change secrets every 90 days
4. **Limit S3 bucket permissions:** Use IAM policies for least privilege access
5. **Enable database SSL:** Always use `?sslmode=require` in connection string

---

## Dependencies Installation

The application uses Node.js with npm for dependency management.

### Install All Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd academicflow

# Install dependencies
npm install
```

### Production Dependencies (Automatically Installed)

These are in `package.json` under `dependencies`:

- **Backend:** express, @neondatabase/serverless, drizzle-orm, openai, @aws-sdk/client-s3
- **Frontend:** react, react-dom, wouter, @tanstack/react-query, tailwindcss
- **Shared:** typescript, zod, date-fns

### Development Dependencies

Only needed locally (already in `package.json`):

- tsx, vite, esbuild, drizzle-kit, @types/* packages

### Verify Installation

```bash
# Check Node.js version (should be 20+)
node --version

# Check npm version
npm --version

# Verify all packages installed
npm list --depth=0
```

---

## Deployment Options

Choose a deployment platform based on your needs:

| Platform | Best For | Pricing | Database Included |
|----------|----------|---------|-------------------|
| **Vercel** | Serverless, auto-scaling | Free tier + $20/mo | No (use Neon/Supabase) |
| **Render** | Simple full-stack apps | Free tier + $7/mo | Yes (PostgreSQL) |
| **Railway** | Fast deploys, good DX | $5/mo minimum | Yes (PostgreSQL) |
| **Fly.io** | Global edge deployment | Free allowance + usage | Yes (PostgreSQL) |
| **AWS/GCP/Azure** | Enterprise, high traffic | Complex pricing | Yes (RDS/Cloud SQL) |
| **DigitalOcean** | Traditional VPS hosting | $6/mo minimum | Manual setup |

### Option 1: Vercel (Recommended for Serverless)

Best for: Auto-scaling, zero-config deployment, excellent for Next.js and React apps

**Note:** This project uses Express backend which doesn't work natively on Vercel serverless. You need to either:
1. Deploy frontend on Vercel + backend elsewhere (Render/Railway)
2. Convert backend to serverless functions (requires refactoring)

**Frontend-Only Deployment:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: academicflow
# - Directory: ./ (current)
```

**Add environment variables:**

```bash
# Backend API URL (deploy backend first on Render/Railway)
vercel env add VITE_API_URL
# Enter: https://your-backend.onrender.com

# If using Clerk
vercel env add VITE_CLERK_PUBLISHABLE_KEY
```

**Build Settings (if asked):**
- Framework: Vite
- Build Command: `vite build`
- Output Directory: `dist`

### Option 2: Render (Recommended for Full-Stack)

Best for: Simple full-stack deployment with minimal configuration

**Setup Steps:**

1. **Create account:** Visit [render.com](https://render.com)

2. **Connect repository:**
   - Dashboard → New → Web Service
   - Connect your GitHub/GitLab repository

3. **Configure service:**
   ```
   Name: academicflow
   Environment: Node
   Region: Choose closest to users (e.g., Oregon)
   Branch: main
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```

4. **Set instance type:**
   - Free tier: Limited hours/month
   - Starter: $7/month (recommended)

5. **Add environment variables:**
   - Click "Environment" tab
   - Add each variable from [Environment Variables section](#environment-variables--secrets)

6. **Create PostgreSQL database (optional):**
   - Dashboard → New → PostgreSQL
   - Name: academicflow-db
   - Plan: Free or Starter ($7/mo)
   - Copy "Internal Database URL"
   - Add as `DATABASE_URL` in web service environment variables

7. **Deploy:**
   - Click "Create Web Service"
   - Render automatically builds and deploys
   - Access at: `https://academicflow.onrender.com`

**Auto-deploys:** Enabled by default on git push

### Option 3: Railway

Best for: Fast deployment, excellent developer experience, simple scaling

**Setup Steps:**

1. **Create account:** Visit [railway.app](https://railway.app)

2. **Create new project:**
   - Dashboard → New Project → Deploy from GitHub repo
   - Select your repository

3. **Add PostgreSQL:**
   - Project → New → Database → PostgreSQL
   - Railway automatically creates `DATABASE_URL` variable

4. **Configure build:**
   - Click your web service
   - Settings → Build & Deploy
   - Build Command: `npm run build`
   - Start Command: `npm run start`

5. **Add environment variables:**
   - Variables tab → Add all required variables
   - `DATABASE_URL` is auto-added from PostgreSQL service

6. **Generate domain:**
   - Settings → Networking → Generate Domain
   - Access at: `https://academicflow-production.up.railway.app`

**Auto-deploys:** Enabled on git push

### Option 4: Fly.io (Global Edge Deployment)

Best for: Low-latency global deployment, advanced users

**Setup Steps:**

1. **Install Fly CLI:**
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login:**
   ```bash
   flyctl auth login
   ```

3. **Initialize app:**
   ```bash
   fly launch
   # Follow prompts:
   # - App name: academicflow
   # - Region: Choose closest (e.g., iad)
   # - PostgreSQL? Yes
   # - Redis? No
   ```

4. **Configure fly.toml:**
   
   Create `fly.toml` in project root:
   ```toml
   app = "academicflow"
   primary_region = "iad"

   [build]
     [build.args]
       NODE_VERSION = "20"

   [env]
     PORT = "8080"
     NODE_ENV = "production"

   [[services]]
     internal_port = 8080
     protocol = "tcp"

     [[services.ports]]
       port = 80
       handlers = ["http"]

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

5. **Set secrets:**
   ```bash
   fly secrets set AWS_ACCESS_KEY_ID=xxx
   fly secrets set AWS_SECRET_ACCESS_KEY=xxx
   fly secrets set AWS_REGION=us-east-1
   fly secrets set AWS_S3_BUCKET_NAME=xxx
   fly secrets set OPENAI_API_KEY=xxx
   fly secrets set SESSION_SECRET=xxx
   # DATABASE_URL auto-set by Fly PostgreSQL
   ```

6. **Deploy:**
   ```bash
   fly deploy
   ```

7. **Access:**
   ```bash
   fly open
   # Opens: https://academicflow.fly.dev
   ```

### Option 5: DigitalOcean App Platform

Best for: Traditional hosting with managed services

**Setup Steps:**

1. **Create account:** Visit [digitalocean.com](https://digitalocean.com)

2. **Create app:**
   - Apps → Create App
   - Connect GitHub repository
   - Select branch: main

3. **Configure resources:**
   - Type: Web Service
   - Run Command: `npm run start`
   - Build Command: `npm install && npm run build`
   - HTTP Port: 8080

4. **Add database:**
   - Resources → Add Resource → Database
   - Engine: PostgreSQL
   - Plan: Basic ($12/mo) or Dev ($7/mo)

5. **Environment variables:**
   - Settings → App-Level Environment Variables
   - Add all required variables
   - `DATABASE_URL` auto-populated from database

6. **Launch:**
   - Review and Create
   - Access at: `https://academicflow-xxxxx.ondigitalocean.app`

### Option 6: Self-Hosted VPS (Ubuntu)

Best for: Maximum control, cost-effective at scale

**Setup Steps:**

1. **Create VPS:**
   - Provider: DigitalOcean, Linode, Vultr, Hetzner
   - Size: 1GB RAM minimum ($6/mo)
   - OS: Ubuntu 22.04 LTS

2. **SSH into server:**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js 20:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **Install PostgreSQL** (if self-hosting database):
   ```bash
   sudo apt install postgresql postgresql-contrib
   # See "Self-Hosted PostgreSQL" section above for full setup
   ```

5. **Clone and setup app:**
   ```bash
   cd /var/www
   git clone https://github.com/your-username/academicflow.git
   cd academicflow
   npm install
   npm run build
   ```

6. **Create environment file:**
   ```bash
   nano .env
   # Add all environment variables
   # Save and exit (Ctrl+X, Y, Enter)
   ```

7. **Install PM2 (process manager):**
   ```bash
   sudo npm install -g pm2
   pm2 start dist/index.js --name academicflow
   pm2 startup
   pm2 save
   ```

8. **Setup Nginx reverse proxy:**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/academicflow
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/academicflow /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

10. **Access your app:**
    - Visit: `https://your-domain.com`

**Auto-updates on git push:**

```bash
# On server, create webhook listener or setup git pull cron
crontab -e
# Add: */15 * * * * cd /var/www/academicflow && git pull && npm install && npm run build && pm2 restart academicflow
```

---

## Post-Deployment Checklist

After deploying, verify everything works:

### 1. Database Connection

```bash
# Test database connectivity
npm run db:push
```

Expected: "No schema changes detected" or successful migration

### 2. Environment Variables

Check all required variables are set:
- [ ] `DATABASE_URL` - Database connects successfully
- [ ] `AWS_ACCESS_KEY_ID` - S3 uploads work
- [ ] `AWS_SECRET_ACCESS_KEY` - S3 uploads work
- [ ] `AWS_REGION` - Matches bucket region
- [ ] `AWS_S3_BUCKET_NAME` - Bucket exists and accessible
- [ ] `OPENAI_API_KEY` - AI features work (test text improvement)
- [ ] `SESSION_SECRET` - Sessions persist across requests

### 3. Feature Testing

Test each major feature:

- [ ] **User Registration/Login:** Can create account and login
- [ ] **Notes:** Can create, edit, delete notes
- [ ] **Code Editor:** Syntax highlighting works for all languages
- [ ] **Citations:** Can generate citations in APA/MLA/IEEE
- [ ] **PDF Upload:** Can upload PDFs (tests S3 integration)
- [ ] **PDF Download:** Can download uploaded PDFs (tests signed URLs)
- [ ] **AI Text Improvement:** Tests OpenAI integration
- [ ] **AI Detection (Faculty):** Tests OpenAI detection API
- [ ] **Public Note Sharing:** Share links work without authentication

### 4. Performance Checks

- [ ] **Load Time:** Homepage loads under 3 seconds
- [ ] **API Response:** API calls respond under 1 second
- [ ] **Database Queries:** No N+1 query issues (check logs)
- [ ] **File Uploads:** PDFs upload successfully under 10 seconds

### 5. Security Verification

- [ ] **HTTPS:** Site uses SSL/TLS encryption
- [ ] **Secrets:** No secrets exposed in client-side code
- [ ] **CORS:** API accepts requests only from your frontend domain
- [ ] **S3 Bucket:** Not publicly accessible (signed URLs only)
- [ ] **Database:** SSL mode enabled in connection string

### 6. Monitoring Setup

Consider adding:

- **Error tracking:** Sentry, Rollbar, or platform-native error tracking
- **Uptime monitoring:** UptimeRobot, Pingdom
- **Database backups:** Enable automated backups on your database provider
- **Log aggregation:** Logtail, Papertrail for centralized logging

---

## Common Issues & Troubleshooting

### Database Connection Errors

**Error:** `ECONNREFUSED` or `Connection timeout`

**Solutions:**
- Verify `DATABASE_URL` is correct
- Check database firewall allows connections from your deployment IP
- Ensure `?sslmode=require` is in connection string for cloud databases
- Test connection locally: `psql $DATABASE_URL`

### Build Failures

**Error:** `Module not found` or `Cannot find module`

**Solutions:**
- Run `npm install` to ensure all dependencies installed
- Check `package.json` for missing dependencies
- Clear build cache: `rm -rf node_modules package-lock.json && npm install`

### S3 Upload Errors

**Error:** `Access Denied` or `InvalidAccessKeyId`

**Solutions:**
- Verify AWS credentials in environment variables
- Check IAM user has S3 permissions
- Confirm bucket name is correct and bucket exists
- Test with AWS CLI: `aws s3 ls s3://your-bucket-name`

### OpenAI API Errors

**Error:** `401 Unauthorized` or `Insufficient quota`

**Solutions:**
- Verify API key is correct and starts with `sk-`
- Check billing settings at platform.openai.com
- Ensure payment method is added
- Check API usage limits haven't been exceeded

### Port Issues

**Error:** `Port 5000 already in use`

**Solutions:**
- Change port in server configuration
- Kill process using port: `lsof -ti:5000 | xargs kill`
- Use environment variable: `PORT=8080 npm start`

---

## Maintenance & Updates

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Database Migrations

When schema changes:

```bash
# Push schema changes
npm run db:push

# Or use migrations for production
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

### Scaling Considerations

As your app grows:

1. **Database:** Upgrade to larger instance or enable read replicas
2. **File Storage:** Monitor S3 costs, consider CDN (CloudFront)
3. **Compute:** Scale horizontally (multiple instances) with load balancer
4. **Caching:** Add Redis for session storage and query caching
5. **CDN:** Use Cloudflare or similar for static asset delivery

---

## Cost Estimation

Monthly costs for small-medium deployment:

| Service | Free Tier | Paid (Low Traffic) | Paid (Medium Traffic) |
|---------|-----------|-------------------|----------------------|
| **Hosting** | Render Free (limited) | Render $7 | Railway $10-20 |
| **Database** | Neon Free (0.5GB) | Neon $19 (3GB) | Supabase $25 |
| **S3 Storage** | AWS Free (5GB/year) | $1-5/month | $10-20/month |
| **OpenAI API** | N/A | $5-20/month | $50-100/month |
| **Total** | ~$0 (free tiers) | **~$20-40/month** | **~$100-150/month** |

---

## Additional Resources

- **Drizzle ORM Docs:** [orm.drizzle.team](https://orm.drizzle.team)
- **Express.js Guide:** [expressjs.com](https://expressjs.com)
- **React Docs:** [react.dev](https://react.dev)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)
- **AWS S3 Docs:** [docs.aws.amazon.com/s3](https://docs.aws.amazon.com/s3/)
- **OpenAI API Docs:** [platform.openai.com/docs](https://platform.openai.com/docs)

---

## Support

For issues specific to this application:
1. Check existing documentation: `TECHNICAL_DOCUMENTATION.md`, `AI_DETECTION_IMPLEMENTATION.md`
2. Review error logs from your deployment platform
3. Test locally with same environment variables to isolate issues

For platform-specific issues, consult your hosting provider's documentation.

---

**Last Updated:** October 24, 2025  
**Version:** 1.0.0

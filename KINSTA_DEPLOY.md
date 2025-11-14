# Kinsta Deployment Guide

This Laravel application is configured for deployment on Kinsta using Nixpacks.

## Pre-Deployment Checklist

- [x] `.env.production` configured with all credentials
- [x] Supabase PostgreSQL database set up and migrated
- [x] Nixpacks configuration (`nixpacks.toml`) created
- [x] Build process configured for React/Inertia.js
- [x] SSL certificate for database connection ready

## Kinsta Configuration

### 1. Create Application on Kinsta

1. Log into your Kinsta dashboard
2. Go to **Applications**
3. Click **Add Application**
4. Connect your GitHub repository
5. Select the branch to deploy (usually `main`)

### 2. Build Settings

Kinsta should auto-detect the Laravel application and use Nixpacks. If not, configure:

- **Build method**: Nixpacks
- **Build command**: Auto-detected from `nixpacks.toml`
- **Start command**: `php artisan serve --host=0.0.0.0 --port=${PORT:-8080}`

### 3. Environment Variables

Copy all variables from your local `.env.production` file to Kinsta's Environment Variables section.

**Required Variables:**
```
APP_NAME=Time to Play
APP_ENV=production
APP_KEY=[Your generated application key]
APP_DEBUG=false
APP_URL=https://time-to-play.games

DB_CONNECTION=pgsql
DB_HOST=[Your Supabase database host]
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=[Your Supabase database password]
PGSSLMODE=require
PGSSLROOTCERT=storage/app/prod-ca-2021.crt

MAIL_MAILER=smtp
MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_USERNAME=[Your Postmark server token]
MAIL_PASSWORD=[Your Postmark server token]
MAIL_FROM_ADDRESS=[Your verified sender email]

REVERB_APP_ID=[Your Reverb app ID]
REVERB_APP_KEY=[Your Reverb app key]
REVERB_APP_SECRET=[Your Reverb app secret]
REVERB_HOST=time-to-play.games
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY=[Your Reverb app key - same as above]
VITE_REVERB_HOST=time-to-play.games
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https

SESSION_DRIVER=database
SESSION_LIFETIME=120
BROADCAST_CONNECTION=reverb
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database
LOG_CHANNEL=stack
LOG_LEVEL=error
```

**Important:** Use the actual values from your local `.env.production` file. Never commit `.env.production` to git.

### 4. SSL Certificate Upload

The Supabase SSL certificate needs to be available in production:

**Option 1: Include in repository (outside web root)**
- Already located at `/reference/prod-ca-2021.crt`
- Will be copied to `storage/app/` during build

**Option 2: Upload via Kinsta**
- Upload the certificate file to the persistent storage
- Update `PGSSLROOTCERT` path if needed

### 5. Post-Deployment Tasks

After the first deployment:

1. **Run Migrations** (if not automatic):
   ```bash
   php artisan migrate --force
   ```

2. **Create Storage Link**:
   ```bash
   php artisan storage:link
   ```

3. **Verify Database Connection**:
   ```bash
   php artisan tinker
   # Then: DB::connection()->getPdo();
   ```

### 6. Domain Configuration

1. In Kinsta, go to **Domains**
2. Add your custom domain: `time-to-play.games`
3. Configure DNS records as instructed by Kinsta
4. Enable HTTPS/SSL (should be automatic)

## Build Process

The `nixpacks.toml` file configures the following build process:

1. **Setup Phase**: Installs PostgreSQL client libraries
2. **Install Phase**: Runs `composer install` and `npm ci`
3. **Build Phase**:
   - Builds frontend assets with Vite (`npm run build`)
   - Creates necessary storage directories
   - Caches Laravel configs, routes, and views
4. **Start Phase**: Starts PHP development server

## WebSockets (Reverb)

⚠️ **Important**: Laravel Reverb requires a persistent connection and may need special configuration on Kinsta.

**Options:**
1. **Deploy Reverb separately** on a service like Railway or Fly.io
2. **Use Pusher** instead of Reverb for WebSockets
3. **Check with Kinsta support** if they support long-running processes

To disable Reverb temporarily:
- Set `BROADCAST_CONNECTION=log` in environment variables
- Update frontend to handle missing WebSocket connection gracefully

## Monitoring

After deployment, monitor:
- Application logs in Kinsta dashboard
- Database connections in Supabase dashboard
- Email sending in Postmark dashboard

## Troubleshooting

### Build Failures
- Check Kinsta build logs for specific errors
- Verify all environment variables are set
- Ensure `composer.lock` and `package-lock.json` are committed

### Database Connection Issues
- Verify Supabase credentials in environment variables
- Check SSL certificate path is correct
- Ensure Supabase project allows connections from Kinsta IPs

### Asset Loading Issues
- Clear config cache: `php artisan config:clear`
- Rebuild assets: `npm run build`
- Verify `APP_URL` matches your domain

## Support

- **Kinsta Support**: https://kinsta.com/help/
- **Laravel Docs**: https://laravel.com/docs
- **Supabase Docs**: https://supabase.com/docs

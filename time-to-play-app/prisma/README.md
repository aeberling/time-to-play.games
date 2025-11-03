# Database Setup Instructions

## Development Setup (Local PostgreSQL)

### Option 1: Using Docker (Recommended for Development)

1. **Install Docker** if not already installed

2. **Start PostgreSQL container**:
   ```bash
   docker run --name timetoplay-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=timetoplay \
     -p 5432:5432 \
     -d postgres:15
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Open Prisma Studio** to view database:
   ```bash
   npx prisma studio
   ```

### Option 2: Install PostgreSQL Locally

1. **Install PostgreSQL 15+**
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt-get install postgresql-15`
   - Windows: Download from postgresql.org

2. **Create database**:
   ```bash
   createdb timetoplay
   ```

3. **Update .env** if needed (change credentials)

4. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

## Production Setup (Neon)

### Create Neon Database

1. **Sign up** at [neon.tech](https://neon.tech)

2. **Create new project**:
   - Project name: "Time to Play"
   - PostgreSQL version: 15
   - Region: Choose closest to your users

3. **Get connection string**:
   - Copy the connection string from Neon dashboard
   - Should look like: `postgresql://user:pass@region.neon.tech/dbname?sslmode=require`

4. **Update .env** for production:
   ```bash
   DATABASE_URL="postgresql://user:pass@region.neon.tech/dbname?sslmode=require"
   ```

5. **Run migrations** on production database:
   ```bash
   npx prisma migrate deploy
   ```

## Common Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name description_of_changes

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open database GUI
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

## Schema Overview

The database includes:

### User Management
- **User**: User accounts (guest and registered)
- **UserStats**: Player statistics and ELO ratings

### Game Management
- **Game**: Game instances
- **GamePlayer**: Players in games (junction table)
- **GameMove**: Move history for each game

### Chat System
- **ChatMessage**: In-game chat messages

## Next Steps

1. ✅ Schema defined
2. ✅ Prisma Client generated
3. ⏳ Run migrations (requires database)
4. ⏳ Create seed data script
5. ⏳ Test database connection

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify port 5432 is not blocked

### "Migration failed"
- Check database credentials
- Ensure database exists
- Check for syntax errors in schema

### "Prisma Client not generated"
- Run `npx prisma generate`
- Check for errors in schema.prisma
- Restart TypeScript server in IDE

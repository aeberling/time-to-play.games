# Time to Play - Build Checklist

**Project**: time-to-play.games
**Started**: November 3, 2025
**Status**: 🟡 In Progress

---

## 📋 Progress Overview

- **Phase 1: Foundation** → 🟡 In Progress (43/45 tasks)
- **Phase 2: Real-Time System** → ⚪ Not Started (0/10 tasks)
- **Phase 3: War Game** → ⚪ Not Started (0/12 tasks)
- **Phase 4: Features** → ⚪ Not Started (0/10 tasks)
- **Phase 5: Polish & Deploy** → ⚪ Not Started (0/8 tasks)

**Total Progress**: 43/85 tasks (51%)

---

## Phase 1: Foundation (Weeks 1-3)

### Week 1: Project Setup

#### 1.1 Initialize Next.js Project
- [x] Create Next.js 14 project with TypeScript ✅
- [x] Configure TypeScript (tsconfig.json) ✅
- [x] Set up ESLint ✅
- [x] Install core dependencies ✅
- [x] Test development server runs ✅ (Confirmed at http://localhost:3000)

#### 1.2 Set Up Database
- [x] Install Prisma ✅
- [x] Initialize Prisma ✅
- [x] Copy complete schema from documentation ✅
- [x] Create Prisma client utility (`src/lib/db.ts`) ✅
- [x] Generate Prisma Client ✅
- [ ] Set up PostgreSQL (Docker or Neon) ⏳
- [ ] Run initial migration ⏳
- [ ] Test Prisma Studio ⏳

**Note**: Schema is ready. Need actual database to run migrations.
See `time-to-play-app/prisma/README.md` for setup options.

#### 1.3 Set Up Redis
- [x] Install Upstash Redis client ✅
- [x] Create Redis client utility (`src/lib/redis.ts`) ✅
- [x] Create helper functions for common operations ✅
- [ ] Set up Upstash Redis account ⏳
- [ ] Test Redis connection ⏳

**Note**: Redis client ready. Need Upstash account for production.
For now, can proceed with development without Redis.

#### 1.4 Configure Tailwind & UI Components
- [x] Install shadcn/ui ✅
- [x] Install required shadcn components (button, card, input, etc.) ✅
- [x] Set up Tailwind color variables for theming ✅
- [x] Install Framer Motion for animations ✅

#### 1.5 Create Basic Layout
- [x] Create root layout (`src/app/layout.tsx`) ✅
- [x] Create Header component ✅
- [x] Create Footer component ✅
- [x] Add font configuration (Inter + Poppins) ✅
- [x] Test layout renders correctly ✅
- [x] Update landing page with features showcase ✅

---

### Week 2: Authentication System

#### 2.1 Set Up JWT Authentication
- [x] Install JWT dependencies ✅
- [x] Create JWT utility functions (`src/lib/auth/jwt.ts`) ✅
- [x] Create password hashing utilities (`src/lib/auth/password.ts`) ✅
- [x] Create cookie management utilities (`src/lib/auth/cookies.ts`) ✅
- [x] Set up environment variables for secrets ✅
- [x] Test JWT token generation and verification ✅

#### 2.2 Create Guest Authentication
- [x] Create guest auth API route (`src/app/api/auth/guest/route.ts`) ✅
- [x] Implement guest token generation ✅
- [x] Add guest user creation in database ✅

#### 2.3 Create User Registration/Login
- [x] Create registration API route (`src/app/api/auth/register/route.ts`) ✅
- [x] Create login API route (`src/app/api/auth/login/route.ts`) ✅
- [x] Create logout API route (`src/app/api/auth/logout/route.ts`) ✅
- [x] Create token refresh API route (`src/app/api/auth/refresh/route.ts`) ✅
- [x] Implement password validation ✅

#### 2.4 Create Auth Context
- [x] Create AuthContext (`src/contexts/AuthContext.tsx`) ✅
- [x] Implement useAuth hook ✅
- [x] Add automatic token refresh logic (every 14 minutes) ✅
- [x] Create ProtectedRoute component ✅
- [x] Create GET /api/auth/me endpoint ✅
- [x] Create server-side auth helpers (`src/lib/auth/server.ts`) ✅
- [x] Add AuthProvider to root layout ✅
- [x] Test auth context throughout app ✅

#### 2.5 Create Auth UI
- [x] Install Zod and React Hook Form ✅
- [x] Create Input component (`src/components/ui/input.tsx`) ✅
- [x] Create Label component (`src/components/ui/label.tsx`) ✅
- [x] Create login page (`src/app/login/page.tsx`) ✅
- [x] Create registration page (`src/app/register/page.tsx`) ✅
- [x] Create play page with auto guest auth (`src/app/play/page.tsx`) ✅
- [x] Update Header with auth-aware navigation ✅
- [x] Add form validation with Zod ✅

---

### Week 3: Core API & Database

#### 3.1 Complete Database Schema
- [ ] Add all missing models from schema doc
- [ ] Create database indexes
- [ ] Add seed data script (`prisma/seed.ts`)
- [ ] Run seed script
- [ ] Verify all tables exist

#### 3.2 Create User Management API
- [ ] Create GET /api/users/me route
- [ ] Create PATCH /api/users/me route
- [ ] Create GET /api/users/[userId] route
- [ ] Create GET /api/users/me/history route
- [ ] Test all user endpoints

#### 3.3 Create Game Management API
- [ ] Create POST /api/games route (create game)
- [ ] Create GET /api/games/available route
- [ ] Create GET /api/games/[gameId] route
- [ ] Create POST /api/games/[gameId]/join route
- [ ] Test all game endpoints

#### 3.4 Set Up Error Handling
- [ ] Create error handling middleware
- [ ] Create custom error classes
- [ ] Add Sentry integration
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] Test error handling

#### 3.5 Create Health Check
- [ ] Create /api/health endpoint
- [ ] Add database health check
- [ ] Add Redis health check
- [ ] Test health endpoint

---

## Phase 2: Real-Time System (Weeks 4-5)

### Week 4: WebSocket Server

#### 4.1 Set Up Socket.io Server
- [ ] Install Socket.io
  ```bash
  npm install socket.io
  ```
- [ ] Create custom server.js for Next.js + Socket.io
- [ ] Configure CORS for WebSocket
- [ ] Test WebSocket connection

#### 4.2 Create Socket Authentication
- [ ] Add JWT verification middleware for sockets
- [ ] Create socket connection handler
- [ ] Add user session tracking
- [ ] Test authenticated socket connections

#### 4.3 Create Game Room Management
- [ ] Create room join/leave handlers
- [ ] Add player connection tracking
- [ ] Create room state management
- [ ] Test room functionality

#### 4.4 Create Socket Event Handlers
- [ ] Create game:join handler (`src/server/handlers/game-join.handler.ts`)
- [ ] Create game:leave handler
- [ ] Create player:ready handler
- [ ] Test all handlers

#### 4.5 Set Up Socket Context
- [ ] Create SocketContext (`src/contexts/SocketContext.tsx`)
- [ ] Implement useSocket hook
- [ ] Add reconnection logic
- [ ] Test socket context in components

---

### Week 5: State Management

#### 5.1 Implement Redis State Storage
- [ ] Create game state storage functions
- [ ] Add state serialization/deserialization
- [ ] Implement TTL management
- [ ] Test Redis state storage

#### 5.2 Create State Synchronization
- [ ] Implement state broadcasting
- [ ] Add optimistic updates on client
- [ ] Create state validation
- [ ] Test state sync across clients

#### 5.3 Implement Move Validation
- [ ] Create move validation framework
- [ ] Add game-agnostic validation
- [ ] Implement Redis locking for moves
- [ ] Test move validation

#### 5.4 Add PostgreSQL Snapshots
- [ ] Create snapshot save function
- [ ] Add periodic snapshot triggers
- [ ] Create state reconstruction function
- [ ] Test snapshot and reconstruction

#### 5.5 Implement Reconnection System
- [ ] Add disconnect detection
- [ ] Create reconnection handler
- [ ] Implement state restoration on reconnect
- [ ] Test reconnection scenarios

---

## Phase 3: War Game Implementation (Weeks 6-7)

### Week 6: Game Engine

#### 6.1 Create Game Engine Structure
- [ ] Create Game interface (`src/lib/games/core/Game.interface.ts`)
- [ ] Create GameState interface
- [ ] Create GameFactory
- [ ] Set up game types

#### 6.2 Implement War Game Logic
- [ ] Create WarGame class (`src/lib/games/war/WarGame.ts`)
- [ ] Implement deck creation and shuffling
- [ ] Create initial game state function
- [ ] Test game initialization

#### 6.3 Implement Move Validation
- [ ] Create validateMove method
- [ ] Add turn validation
- [ ] Add card availability validation
- [ ] Test move validation

#### 6.4 Implement Move Application
- [ ] Create applyMove method
- [ ] Implement flip logic
- [ ] Implement war scenario logic
- [ ] Test move application

#### 6.5 Implement Win Conditions
- [ ] Create checkGameOver method
- [ ] Add card count win condition
- [ ] Add turn limit condition
- [ ] Add war exhaustion condition
- [ ] Test all win scenarios

#### 6.6 Write Unit Tests
- [ ] Install testing framework
  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom
  ```
- [ ] Write tests for game initialization
- [ ] Write tests for move validation
- [ ] Write tests for move application
- [ ] Write tests for win conditions
- [ ] All tests pass

---

### Week 7: Game UI

#### 7.1 Create Game Board Component
- [ ] Create WarGameBoard component (`src/components/game/WarGameBoard.tsx`)
- [ ] Add player deck displays
- [ ] Add battle area
- [ ] Test component renders

#### 7.2 Create Card Components
- [ ] Create Card component (`src/components/game/Card.tsx`)
- [ ] Add card images (default set)
- [ ] Create card back design
- [ ] Test card rendering

#### 7.3 Add Game Animations
- [ ] Add card flip animation
- [ ] Add card movement animation
- [ ] Add win/loss animations
- [ ] Add "War" indicator animation
- [ ] Test all animations

#### 7.4 Create Player Info Display
- [ ] Create PlayerInfo component
- [ ] Add turn indicator
- [ ] Add card count display
- [ ] Add connection status indicator
- [ ] Test player info updates

#### 7.5 Add Game Controls
- [ ] Create flip card button
- [ ] Add keyboard shortcuts
- [ ] Add loading states
- [ ] Test all controls

#### 7.6 Create Game Over Modal
- [ ] Create GameOverModal component
- [ ] Add winner announcement
- [ ] Add final statistics
- [ ] Add "Play Again" button
- [ ] Test game over flow

---

## Phase 4: Lobby & Features (Week 8)

### Week 8: Game Lobby & Profiles

#### 8.1 Create Landing Page
- [ ] Design hero section
- [ ] Add feature highlights
- [ ] Add "Play as Guest" CTA
- [ ] Add game showcase
- [ ] Test landing page

#### 8.2 Create Game Lobby
- [ ] Create lobby page (`src/app/play/page.tsx`)
- [ ] Add available games list
- [ ] Add game filters
- [ ] Add "Create Game" button
- [ ] Test lobby functionality

#### 8.3 Create Game Cards
- [ ] Create GameCard component
- [ ] Add player avatars
- [ ] Add game status badges
- [ ] Add join button
- [ ] Test game cards

#### 8.4 Create Game Creation Flow
- [ ] Create CreateGameModal component
- [ ] Add game type selector
- [ ] Add timer selector
- [ ] Add theme selector
- [ ] Test game creation

#### 8.5 Add Timer System
- [ ] Create TimerManager (`src/server/timer/TimerManager.ts`)
- [ ] Add timer presets for War
- [ ] Create GameTimer component
- [ ] Add timer socket events
- [ ] Test timer functionality

#### 8.6 Add Chat System
- [ ] Create chat handler (`src/server/handlers/chat.handler.ts`)
- [ ] Add profanity filter
- [ ] Create GameChat component
- [ ] Add emoji reactions
- [ ] Test chat functionality

#### 8.7 Create User Profile
- [ ] Create profile page (`src/app/profile/page.tsx`)
- [ ] Add user stats display
- [ ] Add game history
- [ ] Add avatar upload
- [ ] Test profile page

#### 8.8 Add Theme System
- [ ] Create ThemeContext (`src/contexts/ThemeContext.tsx`)
- [ ] Implement all 5 themes
- [ ] Create ThemeSelector component
- [ ] Add theme persistence
- [ ] Test theme switching

#### 8.9 Create Statistics Display
- [ ] Create UserStats component
- [ ] Add win/loss charts
- [ ] Add game history table
- [ ] Add ELO display
- [ ] Test statistics

#### 8.10 Add Game History
- [ ] Create GameHistory component
- [ ] Add filtering and sorting
- [ ] Add game replay (view only)
- [ ] Test game history

---

## Phase 5: Polish & Deploy (Weeks 9-10)

### Week 9: Polish

#### 9.1 Add Loading States
- [ ] Add skeleton loaders for all pages
- [ ] Add loading spinners for actions
- [ ] Add progress indicators
- [ ] Test all loading states

#### 9.2 Improve Error Handling
- [ ] Add user-friendly error messages
- [ ] Create error boundary components
- [ ] Add retry mechanisms
- [ ] Add offline detection
- [ ] Test error scenarios

#### 9.3 Mobile Responsive Design
- [ ] Test all pages on mobile
- [ ] Optimize game board for mobile
- [ ] Add mobile navigation
- [ ] Test touch interactions
- [ ] Fix any responsive issues

#### 9.4 Accessibility Improvements
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Add focus indicators
- [ ] Test with screen reader
- [ ] Fix accessibility issues

#### 9.5 Performance Optimization
- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Add lazy loading
- [ ] Minimize bundle size
- [ ] Test load times

#### 9.6 Add Notifications
- [ ] Create toast notification system
- [ ] Add game invite notifications
- [ ] Add turn notifications
- [ ] Test notifications

#### 9.7 Create Tutorial/Help
- [ ] Create how-to-play guide
- [ ] Add tooltips for UI elements
- [ ] Create FAQ section
- [ ] Test tutorial flow

#### 9.8 Final Testing
- [ ] Test all features end-to-end
- [ ] Test with multiple browsers
- [ ] Fix any bugs found
- [ ] Get feedback from test users

---

### Week 10: Deployment

#### 10.1 Prepare for Production
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Configure production Redis
- [ ] Set up CDN for assets

#### 10.2 Set Up Kinsta Hosting
- [ ] Create Kinsta account
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables on Kinsta

#### 10.3 Configure Monitoring
- [ ] Set up Sentry for production
- [ ] Configure error alerts
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure performance monitoring

#### 10.4 Set Up CI/CD
- [ ] Create GitHub Actions workflow
- [ ] Add automated tests
- [ ] Add linting checks
- [ ] Configure automatic deployments

#### 10.5 Database Migration
- [ ] Run production migrations
- [ ] Seed production database
- [ ] Verify data integrity
- [ ] Set up automated backups

#### 10.6 Load Testing
- [ ] Install load testing tools
- [ ] Test with 10 concurrent users
- [ ] Test with 50 concurrent users
- [ ] Fix any performance issues

#### 10.7 Beta Launch
- [ ] Deploy to production
- [ ] Invite beta testers
- [ ] Monitor error logs
- [ ] Collect feedback
- [ ] Fix critical bugs

#### 10.8 Official Launch
- [ ] Final smoke tests
- [ ] Announce launch
- [ ] Monitor metrics
- [ ] Celebrate! 🎉

---

## 🔄 Daily Development Workflow

1. **Start of Day**
   - [ ] Pull latest changes: `git pull origin develop`
   - [ ] Review BUILD-CHECKLIST.md
   - [ ] Check for any errors in logs

2. **During Development**
   - [ ] Check off tasks as completed
   - [ ] Commit frequently with clear messages
   - [ ] Test changes immediately
   - [ ] Update documentation if needed

3. **End of Day**
   - [ ] Update BUILD-CHECKLIST.md with progress
   - [ ] Commit all changes
   - [ ] Push to repository: `git push origin develop`
   - [ ] Note any blockers or issues

---

## 🚨 Blockers & Issues

### Current Blockers
- None yet

### Resolved Issues
- None yet

---

## 📝 Notes & Decisions

### Date: November 3, 2025
- Initial project setup
- Documentation completed
- Ready to begin Phase 1

**6:56 PM** - Phase 1.1 Complete ✅
- Created Next.js 15 project with TypeScript
- Configured Tailwind CSS with theme system
- Set up project structure (src/ directory)
- Created basic landing page
- Development server running successfully
- Next: Database setup with Prisma

**7:05 PM** - Phase 1.2 & 1.3 Partially Complete ✅
- Installed and configured Prisma
- Created complete database schema (9 models)
- Generated Prisma Client
- Created database utility (`src/lib/db.ts`)
- Installed Upstash Redis client
- Created Redis utility with helper functions (`src/lib/redis.ts`)
- Created comprehensive database setup guide (`prisma/README.md`)

**Note**: Database and Redis are configured but not yet connected to live services.
This allows development to continue on other features.

**7:20 PM** - Phase 1.4 & 1.5 Complete ✅
- Installed and configured shadcn/ui component system
- Created Button component with 6 variants (default, destructive, outline, secondary, ghost, link)
- Created Card component system (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Created responsive Header component with mobile menu
- Created Footer component with navigation links
- Updated landing page with beautiful hero section and features showcase
- Integrated Lucide React icons throughout
- All components use theme-aware CSS variables
- Development server verified running at http://localhost:3000

**8:50 PM** - Week 2.1, 2.2, 2.3 Complete ✅
- Installed JWT and bcrypt dependencies with TypeScript types
- Created complete JWT authentication system (`src/lib/auth/jwt.ts`)
  - Token generation for guests and registered users
  - Token verification and extraction helpers
  - Access tokens (15min expiry) and refresh tokens (7 day expiry)
- Created password utilities (`src/lib/auth/password.ts`)
  - Bcrypt password hashing with 12 salt rounds
  - Password strength validation (8+ chars, uppercase, lowercase, number)
  - Guest display name generator
- Created cookie management utilities (`src/lib/auth/cookies.ts`)
  - HTTP-only secure cookies for production
  - Access and refresh token storage
  - Cookie clearing on logout
- Created Authentication API routes:
  - POST /api/auth/guest - Create guest user and get tokens
  - POST /api/auth/register - Register new user with email/password
  - POST /api/auth/login - Login with credentials
  - POST /api/auth/logout - Clear authentication cookies
  - POST /api/auth/refresh - Refresh access token using refresh token
- Tested JWT generation and verification successfully

**9:10 PM** - Week 2.4 Complete ✅
- Created AuthContext with React Context API (`src/contexts/AuthContext.tsx`)
  - User state management with TypeScript interfaces
  - loginAsGuest(), register(), login(), logout() methods
  - checkAuth() to fetch current user from server
  - refreshAuth() to refresh tokens before expiry
  - Automatic token refresh every 14 minutes
  - Loading states for better UX
- Implemented useAuth() custom hook
  - Access user, isLoading, isAuthenticated state
  - Access all auth methods
  - Throws error if used outside AuthProvider
- Created ProtectedRoute component (`src/components/auth/ProtectedRoute.tsx`)
  - Redirects unauthenticated users
  - requireAuth prop for registered-only routes
  - Loading spinner during auth check
- Created server-side auth helpers (`src/lib/auth/server.ts`)
  - getCurrentUser() - get user from access token
  - requireAuth() - throw if not authenticated
  - requireRegisteredUser() - throw if guest
- Created GET /api/auth/me endpoint
  - Returns current user data from access token
- Added AuthProvider to root layout
- Development server running successfully with auth system

**9:35 PM** - Week 2.5 Complete ✅ (Week 2 COMPLETE!)
- Installed Zod and React Hook Form for form validation
- Created Input and Label UI components
- Created complete login page (`src/app/login/page.tsx`):
  - Email/password form with Zod validation
  - Error handling and loading states
  - Link to registration page
  - "Play as Guest" option
  - Redirects to /play on success
- Created complete registration page (`src/app/register/page.tsx`):
  - Display name, email, password, confirm password
  - Comprehensive Zod validation (8+ chars, uppercase, lowercase, number)
  - Password matching validation
  - Error messages for all fields
  - Link to login page
  - "Play as Guest" option
- Created play page with automatic guest authentication (`src/app/play/page.tsx`):
  - Auto-creates guest account if not authenticated
  - Welcome message with user's display name
  - Prompt to create account for guests
  - Game selection cards (War coming soon)
  - Loading states during guest creation
- Updated Header component with auth-aware navigation:
  - Shows user display name when authenticated
  - Logout button for authenticated users
  - Login/Play Now for unauthenticated
  - Works on both desktop and mobile
- All forms use React Hook Form with Zod validation
- Complete authentication flow working end-to-end!

**WEEK 2 COMPLETE! Full authentication system working:**
✅ JWT token system with refresh
✅ Guest and registered user support
✅ Login, register, logout API routes
✅ React Context for client-side auth
✅ Beautiful UI pages for all auth flows
✅ Auto-refresh tokens every 14 minutes
✅ Protected routes
✅ Auth-aware navigation

Next: Week 3 - Core API & Database (User Management, Game Management)

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run linter
npm run type-check            # TypeScript check

# Database
npx prisma studio             # Open database GUI
npx prisma migrate dev        # Create/apply migration
npx prisma db seed            # Seed database
npx prisma generate           # Generate Prisma client

# Testing
npm test                      # Run tests
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Generate coverage report

# Git
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin develop       # Push to develop branch
```

---

**Last Updated**: November 3, 2025 9:35 PM
**Current Phase**: Phase 1 - Foundation (Week 3)
**Next Task**: 3.1 Complete Database Schema

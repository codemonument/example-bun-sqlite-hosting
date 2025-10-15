# example-bun-sqlite-railway

Example repository to develop scaffolding for using Bun + SQLite with deployment
on Railway.

If running you can find it here:
https://example-bun-sqlite-railway-production.up.railway.app/

## FINAL SUMMARY (2025-10-15)

I'm not using railway for more projects. I cannot automate volume creation via
the railway.toml file and infrastructure as code is extremely important to me.
However, maybe they add it in the future. Keeping this repo around for testing
later.

## Features

- **Pure Bun** - No external frameworks, uses Bun.serve and built-in SQLite
- **TypeScript Throughout** - Both frontend and backend use TypeScript
- **RESTful API** - Complete CRUD operations for todos
- **Persistent Storage** - SQLite database with proper Railway volume setup
- **Production Ready** - Health checks, restart policies, and proper error
  handling

## Tech Stack

- **Runtime**: Bun
- **Database**: SQLite (via `bun:sqlite`)
- **Frontend**: Vanilla HTML + TypeScript
- **Backend**: Bun.serve with TypeScript
- **Deployment**: Railway with Volume storage

## Project Structure

```
.
├── index.ts              # Main server + SQLite setup + API routes
├── public/
│   ├── about.html        # About page
│   ├── todos.html        # Todo app page
│   └── assets/
│       ├── todos.ts      # Frontend TypeScript
│       └── styles.css    # Minimal styling
├── data/                 # SQLite storage (gitignored)
│   └── .keep
├── railway.toml          # Railway deployment config
├── package.json          # Scripts and dependencies
└── README.md
```

## API Endpoints

- `GET /` - Redirects to `/todos`
- `GET /todos` - Todo list page
- `GET /about` - About page
- `GET /healthz` - Health check endpoint
- `GET /api/todos` - List all todos
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a single todo
- `PATCH /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Local Development

### Prerequisites

- [Bun](https://bun.sh) installed

### Setup

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Start the development server with hot reload:

```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

The SQLite database will be created at `data/app.sqlite`.

### Available Scripts

```bash
# Development with hot reload
bun run dev

# Development with file watching
bun run dev-watch

# Production mode
bun run start

# Build for production
bun run build

# Railway setup (requires Railway CLI)
bun run railway:setup      # Setup volume + env var
bun run railway:volume     # Add volume only
bun run railway:env        # Set env var only
```

## Railway Deployment

### Prerequisites

- GitHub account
- [Railway account](https://railway.app)
- [Railway CLI](https://docs.railway.app/guides/cli) (optional, for automated
  setup)

### Deployment Steps

#### Option A: Dashboard Setup

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Railway Project**

   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Bun using `bun.lockb`

3. **Add Volume for SQLite**

   - In your Railway project, go to your service
   - Click "Volumes" tab
   - Click "Add Volume"
   - Set mount path: `/data`

4. **Set Environment Variable**

   - Click "Variables" tab
   - Add: `DB_PATH=/data/app.sqlite`

5. **Deploy**
   - Railway will automatically deploy
   - Health checks via `/healthz` endpoint
   - Restart policy: ON_FAILURE with 3 retries

#### Option B: CLI Setup (Automated)

1. **Install Railway CLI**

   ```bash
   # macOS/Linux
   curl -fsSL https://railway.app/install.sh | sh

   # Or with npm
   npm i -g @railway/cli
   ```

2. **Login & Link Project**

   ```bash
   railway login
   railway link  # Link to existing project or create new one
   ```

3. **Setup Volume & Environment (One Command)**

   ```bash
   bun run railway:setup
   ```

   Or run individually:

   ```bash
   # Add volume
   bun run railway:volume

   # Set environment variable
   bun run railway:env
   ```

4. **Deploy** (optional via CLI)

   ```bash
   railway up
   ```

### Environment Variables

- `PORT` - Set automatically by Railway
- `DB_PATH` - Path to SQLite database (set to `/data/app.sqlite` on Railway)

### Railway Configuration

The [railway.toml](railway.toml) file configures:

- **Builder**: Nixpacks (auto-detects Bun)
- **Start Command**: `bun index.ts`
- **Health Check**: `/healthz` endpoint with 10s timeout
- **Restart Policy**: ON_FAILURE with max 3 retries

## Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER todos_updated_at
AFTER UPDATE ON todos
BEGIN
  UPDATE todos SET updated_at = datetime('now') WHERE id = NEW.id;
END;
```

## Todo App Features

- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Edit todo text (double-click)
- ✅ Delete todos
- ✅ Persistent storage

## Architecture

### Backend (index.ts)

- Bun.serve for HTTP handling
- SQLite database with prepared statements
- RESTful API with proper error handling
- Static file serving for HTML/CSS/TS

### Frontend (todos.ts)

- TypeScript with DOM manipulation
- Fetch API for backend communication
- Simple, responsive UI

### Deployment (Railway)

- Volume-mounted persistent storage
- Health check monitoring
- Automatic restarts on failure
- Environment-based configuration

## Contributing

This is a template/scaffolding project. Feel free to:

- Fork and modify for your needs
- Add features (authentication, pagination, etc.)
- Improve the UI/UX
- Add tests

## License

MIT

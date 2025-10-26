# example-bun-sqlite-hosting

Example repository to develop scaffolding for using Bun + SQLite with deployment
on Railway.

If running you can find it:

- at railway: https://example-bun-sqlite-railway-production.up.railway.app/
- at fly.io: https://example-bun-sqlite-hosting.fly.dev
- at sevalla: https://example-bun-sqlite-hosting-sc13n.sevalla.app/todos

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
- **Deployments**:
  - Railway with Volume storage
  - Fly.io with Volume storage

## Project Structure

```
.
├── src/
│   ├── index.ts              # Main server + SQLite setup + API routes
│   ├── client/               # Frontend files
│   │   ├── about.html        # About page
│   │   ├── todos.html        # Todo app page
│   │   └── assets/
│   │       ├── todos.ts      # Frontend TypeScript
│   │       └── styles.css    # Minimal styling
│   └── db.ts                 # Database setup and queries
├── data/                     # SQLite storage (gitignored)
│   └── .keep
├── railway.toml              # Railway deployment config
├── fly.toml                  # Fly.io deployment config
├── package.json              # Scripts and dependencies
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

### Railway CLI Setup (Automated)

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
- **Start Command**: `bun src/index.ts`
- **Health Check**: `/healthz` endpoint with 10s timeout
- **Restart Policy**: ON_FAILURE with max 3 retries

---

# Deployment Insights gathered

## Sevalla 2025-10-15: really solid ui, but no Infra as code again!

For Deployment:

- added env var PORT=8080 to be aligned with the default expectation
- Not added env var DB_PATH, default is data/app.sqlite
  - Update: added DB_PATH=/data/app.sqlite, since the default path might be
    wrong, dependning on the workdir configuration in the final docker image!
- added "Disk" in ui, basically the same as a volume
- redeployed

=> worked flawlessly => builds with nixpacks like railway and uses dockerfile
under the hood

## Northflank 2025-10-15: has infrastructure as code, but in a weird way

AFAIK:

- you can create templates
- these templates can be synced with another git repo, different to the one you
  deploying your app from (?!? - why tf)

## Fly.io 2025-10-15: works ok, coldstart is extremely slow

- some issues with the initial deployment, the automatic detection got some
  things wrong as i gave the git repo to fly.io
- Good: volume was created and mounted correctly
- Question: Does scaling the volume via fly.toml work?
- Bad: Cold Start time is really bad (initial request did fail due to
  coldstart!)

## Railway 2025-10-15: good, but needs manual volume setup

- Good: volume was created and mounted correctly
- Question: Does scaling the volume via railway.toml work? => no, volume
  management is completely manual, via dashboard

---

# Dev Info

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

### Deployments - see above

- Volume-mounted persistent storage
- Health check monitoring
- Automatic restarts on failure
- Environment-based configuration
- strict Infrastructure as Code, as far as possible

## Contributing

This is a template/scaffolding project. Feel free to:

- Fork and modify for your needs
- Add features (authentication, pagination, etc.)
- Improve the UI/UX
- Add tests

## License

MIT

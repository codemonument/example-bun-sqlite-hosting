# example-bun-sqlite-railway

Example repository to develop scaffolding for using Bun + SQLite with deployment on Railway.

## Features

- **Pure Bun** - No external frameworks, uses Bun.serve and built-in SQLite
- **TypeScript Throughout** - Both frontend and backend use TypeScript
- **RESTful API** - Complete CRUD operations for todos
- **Persistent Storage** - SQLite database with proper Railway volume setup
- **Production Ready** - Health checks, restart policies, and proper error handling

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

### Production Mode

To run in production mode:

```bash
bun run start
```

## Railway Deployment

### Prerequisites

- GitHub account
- [Railway account](https://railway.app)

### Deployment Steps

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
   - Click "Variables" tab
   - Add a new Volume:
     - Mount path: `/data`
   - Add environment variable:
     - `DB_PATH=/data/app.sqlite`

4. **Deploy**
   - Railway will automatically deploy
   - Health checks via `/healthz` endpoint
   - Restart policy: ON_FAILURE with 3 retries

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

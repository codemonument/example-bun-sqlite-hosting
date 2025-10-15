# AGENTS.md - Development Guidelines

## Build/Run Commands
- `bun run dev` - Development with hot reload
- `bun run dev-watch` - Development with file watching  
- `bun run start` - Production mode
- `bun test` - Run tests (if any exist)

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled with `noUncheckedIndexedAccess` and `noImplicitOverride`
- ESNext target with bundler module resolution
- No emit (Bun handles compilation)

### Import Patterns
- Use Bun's built-in modules: `bun:sqlite`, `bun:fs`
- HTML imports for static files: `import page from "./page.html"`
- Type imports: `import { type TodoRow } from "./db"`

### Naming Conventions
- Interfaces: `PascalCase` (e.g., `TodoRow`, `Todo`)
- Functions/variables: `camelCase` (e.g., `rowToTodo`, `selectAll`)
- Database queries: descriptive names (e.g., `selectAll`, `insertTodo`)

### Error Handling
- Always validate JSON parsing with try/catch
- Return proper HTTP status codes (400, 404, 201, 204)
- Use consistent error response format: `{ error: "message" }`

### Database Patterns
- Use prepared statements with named parameters (`$id`, `$text`)
- Convert SQLite integers to booleans in `rowToTodo()`
- Handle undefined results from `get()` queries

### API Response Format
- Success: Direct JSON data
- Errors: `{ error: "message" }` with appropriate status code
- Empty response: `204 No Content` for DELETE operations
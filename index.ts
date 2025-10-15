import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import path from "path";
// Import HTML files using Bun v1.3 HTML imports
import aboutPage from "./public/about.html";
import todosPage from "./public/todos.html";

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || path.resolve("data/app.sqlite");

// Ensure data directory exists
mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Initialize SQLite database
const db = new Database(DB_PATH);

// Create tables and triggers
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TRIGGER IF NOT EXISTS todos_updated_at
  AFTER UPDATE ON todos
  BEGIN
    UPDATE todos SET updated_at = datetime('now') WHERE id = NEW.id;
  END;
`);

// Prepare SQL queries
const selectAll = db.query(
    "SELECT id, text, completed, created_at, updated_at FROM todos ORDER BY id DESC",
);
const selectOne = db.query(
    "SELECT id, text, completed, created_at, updated_at FROM todos WHERE id=$id",
);
const insertTodo = db.query("INSERT INTO todos (text) VALUES ($text)");
const updateTodo = db.query(
    "UPDATE todos SET text=COALESCE($text, text), completed=COALESCE($completed, completed) WHERE id=$id",
);
const deleteTodo = db.query("DELETE FROM todos WHERE id=$id");

// Helper function to create JSON responses
function json(data: unknown, init: ResponseInit = {}) {
    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        ...init,
    });
}

// Start the server using Bun v1.3's new routing system
Bun.serve({
    port: PORT,

    // Enable development features (HMR and browser console forwarding)
    development: {
        hmr: true, // Hot Module Replacement
        console: true, // Echo console logs from browser to terminal
    },

    // Define routes using the new routes API
    routes: {
        // Static pages using HTML imports
        "/": () => Response.redirect("/todos", 302),
        "/about": aboutPage,
        "/todos": todosPage,
        // "/assets/*": (req) => {
        //     const url = new URL(req.url);
        //     return new Response(Bun.file("public" + url.pathname));
        // },
        "/healthz": new Response("ok"),

        // API routes
        "/api/todos": {
            // List all todos
            GET: () => {
                const rows = selectAll.all() as Array<{
                    id: number;
                    text: string;
                    completed: number;
                    created_at: string;
                    updated_at: string;
                }>;
                const todos = rows.map((r) => ({
                    ...r,
                    completed: !!r.completed,
                }));
                return json(todos);
            },

            // Create new todo
            POST: async (req) => {
                let body: any;
                try {
                    body = await req.json();
                } catch {
                    return json({ error: "Invalid JSON" }, { status: 400 });
                }
                const text = (body?.text ?? "").toString().trim();
                if (!text) {
                    return json({ error: "text is required" }, { status: 400 });
                }
                const res = insertTodo.run({ $text: text });
                const id = Number(res.lastInsertRowid);
                const row = selectOne.get({ $id: id }) as {
                    id: number;
                    text: string;
                    completed: number;
                    created_at: string;
                    updated_at: string;
                };
                return json({ ...row, completed: !!row.completed }, {
                    status: 201,
                });
            },
        },

        // Individual todo operations with dynamic parameter
        "/api/todos/:id": {
            // Get single todo
            GET: (req) => {
                const id = Number(req.params.id);
                const row = selectOne.get({ $id: id }) as
                    | {
                        id: number;
                        text: string;
                        completed: number;
                        created_at: string;
                        updated_at: string;
                    }
                    | undefined;
                if (!row) {
                    return json({ error: "Not found" }, { status: 404 });
                }
                return json({ ...row, completed: !!row.completed });
            },

            // Update todo
            PATCH: async (req) => {
                const id = Number(req.params.id);
                let body: any;
                try {
                    body = await req.json();
                } catch {
                    return json({ error: "Invalid JSON" }, { status: 400 });
                }

                const updates: {
                    $id: number;
                    $text?: string;
                    $completed?: number;
                } = {
                    $id: id,
                };

                if (typeof body.text === "string") {
                    updates.$text = body.text.trim();
                }
                if (typeof body.completed === "boolean") {
                    updates.$completed = body.completed ? 1 : 0;
                }

                if (
                    updates.$text === undefined &&
                    updates.$completed === undefined
                ) {
                    return json({ error: "No fields to update" }, {
                        status: 400,
                    });
                }

                updateTodo.run(updates);
                const row = selectOne.get({ $id: id }) as
                    | {
                        id: number;
                        text: string;
                        completed: number;
                        created_at: string;
                        updated_at: string;
                    }
                    | undefined;

                if (!row) {
                    return json({ error: "Not found" }, { status: 404 });
                }
                return json({ ...row, completed: !!row.completed });
            },

            // Delete todo
            DELETE: (req) => {
                const id = Number(req.params.id);
                deleteTodo.run({ $id: id });
                return new Response(null, { status: 204 });
            },
        },
    },
});

console.log(`Server listening on http://localhost:${PORT}`);

// Import HTML files using Bun HTML imports
import aboutPage from "./client/about.html";
import todosPage from "./client/todos.html";
// Import database queries and types
import { queries, rowToTodo, type TodoRow } from "./db";

const PORT = Number(process.env.PORT || 3000);

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
        "/healthz": new Response("ok"),
        // API routes
        "/api/todos": {
            // List all todos
            GET: () => {
                const rows = queries.selectAll.all() as TodoRow[];
                const todos = rows.map(rowToTodo);
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
                const res = queries.insertTodo.run({ $text: text });
                const id = Number(res.lastInsertRowid);
                const row = queries.selectOne.get({ $id: id }) as TodoRow;
                return json(rowToTodo(row), { status: 201 });
            },
        },

        // Individual todo operations with dynamic parameter
        "/api/todos/:id": {
            // Get single todo
            GET: (req) => {
                const id = Number(req.params.id);
                const row = queries.selectOne.get({ $id: id }) as
                    | TodoRow
                    | undefined;
                if (!row) {
                    return json({ error: "Not found" }, { status: 404 });
                }
                return json(rowToTodo(row));
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

                queries.updateTodo.run(updates);
                const row = queries.selectOne.get({ $id: id }) as
                    | TodoRow
                    | undefined;

                if (!row) {
                    return json({ error: "Not found" }, { status: 404 });
                }
                return json(rowToTodo(row));
            },

            // Delete todo
            DELETE: (req) => {
                const id = Number(req.params.id);
                queries.deleteTodo.run({ $id: id });
                return new Response(null, { status: 204 });
            },
        },
    },
});

console.log(`Server listening on http://localhost:${PORT}`);

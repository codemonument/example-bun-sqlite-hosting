import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import path from "path";

// Database configuration
const DB_PATH = process.env.DB_PATH || path.resolve("data/app.sqlite");

// Ensure data directory exists
mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Initialize SQLite database
export const db = new Database(DB_PATH);

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

// TypeScript types
export interface TodoRow {
    id: number;
    text: string;
    completed: number;
    created_at: string;
    updated_at: string;
}

export interface Todo {
    id: number;
    text: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

// Prepare SQL queries
export const queries = {
    selectAll: db.query(
        "SELECT id, text, completed, created_at, updated_at FROM todos ORDER BY id DESC",
    ),
    selectOne: db.query(
        "SELECT id, text, completed, created_at, updated_at FROM todos WHERE id=$id",
    ),
    insertTodo: db.query("INSERT INTO todos (text) VALUES ($text)"),
    updateTodo: db.query(
        "UPDATE todos SET text=COALESCE($text, text), completed=COALESCE($completed, completed) WHERE id=$id",
    ),
    deleteTodo: db.query("DELETE FROM todos WHERE id=$id"),
};

// Helper to convert TodoRow to Todo (number to boolean conversion)
export function rowToTodo(row: TodoRow): Todo {
    return {
        ...row,
        completed: !!row.completed,
    };
}

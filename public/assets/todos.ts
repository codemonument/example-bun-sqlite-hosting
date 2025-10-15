interface Todo {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const list = document.getElementById("list") as HTMLUListElement;
const form = document.getElementById("new-todo") as HTMLFormElement;
const input = document.getElementById("todo-text") as HTMLInputElement;

async function fetchTodos() {
  const res = await fetch("/api/todos");
  const data = (await res.json()) as Todo[];
  render(data);
}

function render(items: Todo[]) {
  list.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.dataset.id = item.id.toString();
    li.className = item.completed ? "completed" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed;
    checkbox.addEventListener(
      "change",
      () => updateTodo(item.id, { completed: checkbox.checked }),
    );

    const span = document.createElement("span");
    span.textContent = item.text;
    span.title = "Double-click to edit";
    span.addEventListener("dblclick", async () => {
      const text = prompt("Edit todo", item.text);
      if (text != null && text.trim()) {
        await updateTodo(item.id, { text: text.trim() });
      }
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", () => deleteTodo(item.id));

    li.append(checkbox, span, delBtn);
    list.appendChild(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (res.ok) {
    input.value = "";
    await fetchTodos();
  }
});

async function updateTodo(
  id: number,
  payload: { text?: string; completed?: boolean },
) {
  await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await fetchTodos();
}

async function deleteTodo(id: number) {
  await fetch(`/api/todos/${id}`, { method: "DELETE" });
  await fetchTodos();
}

// Load todos on page load
fetchTodos();

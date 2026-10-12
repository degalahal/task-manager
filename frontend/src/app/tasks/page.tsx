
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

const API_URL = "http://localhost:4000";

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export default function TasksPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/tasks`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "Unable to load tasks.");
    }

    setTasks(data as Task[]);
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
        await loadTasks();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Cannot connect to the backend."
        );
      } finally {
        setLoading(false);
      }
    }

    void initialize();
  }, [router, loadTasks]);

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to create task.");
      }

      setTitle("");
      setDescription("");
      setMessage("Task created successfully.");
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(task: Task, status: TaskStatus) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to update task.");
      }

      setMessage("Task status updated.");
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update task."
      );
    }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to delete task.");
      }

      setMessage("Task deleted successfully.");
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete task."
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading your tasks...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p role="status">
          {error || "Redirecting to login..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Task Manager
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome, {user.name}
            </p>
          </div>

          <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm text-indigo-800">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </header>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Create a task
          </h2>

          <form onSubmit={createTask} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Task title
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
                placeholder="e.g. Finish the project"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Add some details..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Add task"}
            </button>
          </form>
        </section>

        {message && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-green-50 p-3 text-green-800"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Your tasks
          </h2>

          {tasks.length === 0 ? (
            <p className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-slate-600">
              No tasks yet. Create your first task above.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-semibold text-slate-900">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-2 whitespace-pre-wrap break-words text-slate-600">
                          {task.description}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        Created{" "}
                        {new Date(task.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={`Status for ${task.title}`}
                        value={task.status}
                        onChange={(event) =>
                          updateStatus(task, event.target.value as TaskStatus)
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        {Object.entries(statusLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => deleteTask(task)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

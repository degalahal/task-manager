
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, ListTodo } from "lucide-react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
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

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200",
  DONE: "bg-green-50 text-green-700 ring-green-200",
};

export default function TasksPage() {
  const router = useRouter();
  const initialized = useRef(false);

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

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
    if (initialized.current) return;
    initialized.current = true;

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

        setUser(data.user ?? data);
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

  async function updateStatus(task: Task, status: TaskStatus) {
    setError("");
    setMessage("");
    setUpdatingTaskId(task.id);

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

      setMessage("Task status updated successfully.");
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update task."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingTaskId(task.id);

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
    } finally {
      setDeletingTaskId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading your tasks...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <p role="status" className="text-slate-600">
          {error || "Redirecting to login..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <ListTodo size={18} />
              <span>Task workspace</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              View &amp; Modify Tasks
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome, {user.name}. Manage your tasks and deadlines here.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-5 py-3 shadow-sm">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <ListTodo size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {tasks.length}
              </p>
              <p className="text-xs text-slate-500">
                {tasks.length === 1 ? "Total task" : "Total tasks"}
              </p>
            </div>
          </div>
        </header>

        {message && (
          <p
            role="status"
            aria-live="polite"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your tasks
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review deadlines and update task status.
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <ListTodo size={28} />
              </div>
              <h3 className="font-semibold text-slate-900">
                No tasks yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Open the sidebar and choose Create Tasks to add your first task.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="break-words text-lg font-bold text-slate-900">
                          {task.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[task.status]}`}
                        >
                          {statusLabels[task.status]}
                        </span>
                      </div>

                      {task.description ? (
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                          {task.description}
                        </p>
                      ) : (
                        <p className="text-sm italic text-slate-400">
                          No description provided.
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={17}
                            className="text-indigo-500"
                          />
                          <span className="text-slate-500">Deadline:</span>
                          {task.deadline ? (
                            <span className="font-medium text-slate-700">
                              {formatDate(task.deadline)}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not set</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock3 size={16} />
                          <span>
                            Created {new Date(task.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <select
                        aria-label={`Status for ${task.title}`}
                        value={task.status}
                        disabled={updatingTaskId === task.id}
                        onChange={(event) =>
                          updateStatus(task, event.target.value as TaskStatus)
                        }
                        className="min-w-32 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={
                          deletingTaskId === task.id ||
                          updatingTaskId === task.id
                        }
                        onClick={() => deleteTask(task)}
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingTaskId === task.id ? "Deleting..." : "Delete"}
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

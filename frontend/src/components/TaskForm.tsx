
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, PlusCircle } from "lucide-react";

const API_URL = "http://localhost:4000";

export default function TaskForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          deadline: deadline || undefined,

        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        setMessage(data.message ?? "Could not create the task.");
        return;
      }

      setMessage("Task created successfully!");
      setTitle("");
      setDescription("");
      setDeadline("");
    } catch {
      setMessage("Cannot connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
          <PlusCircle size={25} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create a task
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add a new task to your workspace.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Task title
          </label>

          <input
            id="title"
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Complete project documentation"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what needs to be done..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        
<div className="space-y-2">
  <label
    htmlFor="deadline"
    className="block text-sm font-semibold text-slate-700"
  >
    Deadline <span className="font-normal text-slate-400">(Optional)</span>
  </label>

  <div className="relative">
    <CalendarDays
      size={19}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"
    />

    <input
      id="deadline"
      type="date"
      value={deadline}
      min={new Date().toISOString().slice(0, 10)}
      onChange={(event) => setDeadline(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
    />
  </div>

  <p className="text-xs text-slate-500">
    Choose the date by which you want to complete this task.
  </p>
</div>


        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlusCircle size={19} />
          {loading ? "Creating task..." : "Create Task"}
        </button>

        {message && (
          <p role="status" aria-live="polite" className="text-sm text-slate-700">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

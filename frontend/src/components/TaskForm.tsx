
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, PlusCircle } from "lucide-react";
import { API_URL } from "@/lib/api";

type FieldErrors = {
  title?: string;
  description?: string;
  deadline?: string;
};

function getLocalDateString() {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 10);
}

export default function TaskForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function clearFeedback(field?: keyof FieldErrors) {
    setMessage("");

    if (field) {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    } else {
      setFieldErrors({});
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    clearFeedback();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const errors: FieldErrors = {};

    if (!trimmedTitle) {
      errors.title = "Task title is required.";
    } else if (trimmedTitle.length > 200) {
      errors.title = "Title cannot exceed 200 characters.";
    }

    if (trimmedDescription.length > 2000) {
      errors.description = "Description cannot exceed 2000 characters.";
    }

    if (deadline) {
      const parsedDate = new Date(`${deadline}T00:00:00.000Z`);
      const validDate =
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === deadline;

      if (!validDate) {
        errors.deadline = "Please select a valid deadline.";
      } else if (deadline < getLocalDateString()) {
        errors.deadline = "Deadline cannot be in the past.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessageType("error");
      setMessage("Please correct the highlighted fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          ...(deadline ? { deadline } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }

      if (!response.ok) {
        const backendErrors =
          data?.errors?.fieldErrors ?? data?.errors ?? {};

        const nextErrors: FieldErrors = {};

        for (const field of ["title", "description", "deadline"] as const) {
          const value = backendErrors[field];

          if (Array.isArray(value) && typeof value[0] === "string") {
            nextErrors[field] = value[0];
          }
        }

        setFieldErrors(nextErrors);
        setMessageType("error");

        if (Object.keys(nextErrors).length > 0) {
          setMessage("Please correct the highlighted fields.");
        } else if (response.status === 429) {
          setMessage("Too many requests. Please wait a moment and try again.");
        } else if (response.status >= 500) {
          setMessage("The server encountered an error. Please try again later.");
        } else {
          setMessage(data?.message ?? "Could not create the task.");
        }

        return;
      }

      setMessageType("success");
      setMessage("Task created successfully!");
      setTitle("");
      setDescription("");
      setDeadline("");
      setFieldErrors({});
    } catch {
      setMessageType("error");
      setMessage(
        "Cannot connect to the backend. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

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

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Task title
          </label>

          <input
            id="title"
            name="title"
            required
            maxLength={200}
            value={title}
            disabled={loading}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? "title-error" : undefined}
            onChange={(event) => {
              setTitle(event.target.value);
              clearFeedback("title");
            }}
            placeholder="e.g. Complete project documentation"
            className={`${inputClass} ${
              fieldErrors.title ? "border-red-500" : "border-slate-300"
            } disabled:bg-slate-50`}
          />

          {fieldErrors.title && (
            <p id="title-error" role="alert" className="mt-1 text-sm text-red-600">
              {fieldErrors.title}
            </p>
          )}
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
            name="description"
            rows={4}
            maxLength={2000}
            value={description}
            disabled={loading}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description ? "description-error" : undefined
            }
            onChange={(event) => {
              setDescription(event.target.value);
              clearFeedback("description");
            }}
            placeholder="Describe what needs to be done..."
            className={`${inputClass} resize-y ${
              fieldErrors.description ? "border-red-500" : "border-slate-300"
            } disabled:bg-slate-50`}
          />

          {fieldErrors.description && (
            <p
              id="description-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.description}
            </p>
          )}
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
              name="deadline"
              type="date"
              value={deadline}
              min={getLocalDateString()}
              disabled={loading}
              aria-invalid={Boolean(fieldErrors.deadline)}
              aria-describedby={
                fieldErrors.deadline ? "deadline-error" : undefined
              }
              onChange={(event) => {
                setDeadline(event.target.value);
                clearFeedback("deadline");
              }}
              className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                fieldErrors.deadline ? "border-red-500" : "border-slate-200"
              } disabled:bg-slate-50`}
            />
          </div>

          {fieldErrors.deadline && (
            <p
              id="deadline-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.deadline}
            </p>
          )}

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
          <p
            role={messageType === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`text-sm ${
              messageType === "error" ? "text-red-600" : "text-green-700"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

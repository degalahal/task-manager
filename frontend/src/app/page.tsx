
"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Click the button to check login.");
  const [loading, setLoading] = useState(false);

  async function checkLogin() {
    setLoading(true);
    setMessage("");
    setUser(null);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "Authentication failed.");
        return;
      }

      setUser(data.user);
      setMessage("Authentication successful!");
    } catch {
      setMessage("Cannot connect to the backend. Check that it is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">
          Task Manager
        </h1>

        <p className="mt-2 text-slate-600">
          Authentication connection test
        </p>

        <button
          onClick={checkLogin}
          disabled={loading}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Current User"}
        </button>

        <p role="status" className="mt-5 text-slate-700">
          {message}
        </p>

        {user && (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold">User Details</h2>
            <p className="mt-2">
              <strong>Name:</strong> {user.name}
            </p>
            <p className="mt-1">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="mt-1 break-all">
              <strong>ID:</strong> {user.id}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

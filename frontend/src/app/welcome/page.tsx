
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, CheckSquare, UserRound } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { API_URL } from "@/lib/api";


type User = {
  id: string;
  name: string;
  email: string;
};

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();
        setUser(data.user ?? data);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading your workspace...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            className="rounded-xl p-3 text-slate-700 transition hover:bg-slate-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <CheckSquare size={22} />
            </div>
            <span className="text-lg font-bold text-slate-900">
              TaskFlow
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
          <UserRound size={18} className="text-indigo-600" />
          <span className="hidden text-sm font-medium text-slate-700 sm:inline">
            {user.name}
          </span>
        </div>
      </header>

      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-slate-950/30"
          />

          <div className="fixed inset-y-0 left-0 z-40">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-14">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <CheckSquare size={40} />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Your workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome, {user.name}!
          </h1>

          <p className="mx-auto mt-4 max-w-md leading-7 text-slate-500">
            Stay organized, manage your tasks, and keep track of your
            progress — all in one place.
          </p>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            Open Workspace
          </button>
        </div>
      </section>
    </main>
  );
}

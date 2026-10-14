
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TaskForm from "@/components/TaskForm";
import { API_URL } from "@/lib/api";

export default function CreateTaskPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        if (active) {
          setIsAuthenticated(true);
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    void checkAuthentication();

    return () => {
      active = false;
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Checking your session...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="flex h-20 items-center gap-4 border-b border-slate-200 bg-white px-5 sm:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          className="rounded-xl p-3 text-slate-700 transition hover:bg-slate-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <h1 className="text-xl font-bold text-slate-900">TaskFlow</h1>
      </header>

      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/30"
          />

          <div className="fixed inset-y-0 left-0 z-40">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="px-4 py-10 sm:px-8">
        <TaskForm />
      </div>
    </main>
  );
}

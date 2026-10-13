
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TaskForm from "@/components/TaskForm";

export default function CreateTaskPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

        <h1 className="text-xl font-bold text-slate-900">
          TaskFlow
        </h1>
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

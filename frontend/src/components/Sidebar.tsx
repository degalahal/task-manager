
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ListTodo,
  PlusCircle,
  CheckSquare,
} from "lucide-react";

type SidebarProps = {
  onNavigate?: () => void;
};

const menuItems = [
  {
    label: "Dashboard",
    href: "/welcome",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
  },
  {
    label: "Create Tasks",
    href: "/tasks/create",
    icon: PlusCircle,
  },
  {
    label: "View & Modify Tasks",
    href: "/tasks",
    icon: ListTodo,
  },
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-64 shrink-0 flex-col bg-slate-950 px-4 py-6 text-white shadow-2xl">
      <div className="mb-10 px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <CheckSquare size={23} />
          </div>

          <div>
            <h2 className="text-lg font-bold">TaskFlow</h2>
            <p className="text-xs text-slate-400">
              Task Management
            </p>
          </div>
        </div>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Workspace
      </p>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm font-semibold">Stay organized</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Plan your work, track progress, and meet your deadlines.
        </p>
      </div>
    </aside>
  );
}

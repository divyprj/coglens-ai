'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Results', href: '/results', icon: FileSearch },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-coglens-bg">
      {/* ── Desktop sidebar ────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col border-r border-coglens-border bg-coglens-surface">
        <div className="flex h-full flex-col">
          {/* Branding */}
          <div className="flex h-14 shrink-0 items-center px-5 border-b border-coglens-border">
            <Link href="/" className="flex items-center gap-0.5 select-none">
              <span className="text-[15px] font-semibold tracking-tight text-coglens-primary">
                Cog
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-coglens-muted">
                Lens
              </span>
              <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-coglens-accent" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <ul className="flex flex-col gap-0.5">
              {sidebarItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                        active
                          ? 'bg-coglens-card text-coglens-primary'
                          : 'text-coglens-secondary hover:bg-coglens-card/60 hover:text-coglens-primary'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="dashboard-sidebar-active"
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-coglens-accent"
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-coglens-primary' : 'text-coglens-muted'
                        }`}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom */}
          <div className="shrink-0 border-t border-coglens-border px-5 py-4">
            <p className="text-[11px] text-coglens-muted">CogLens v0.1.0</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ─────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 flex w-60 flex-col bg-coglens-surface border-r border-coglens-border lg:hidden"
            >
              <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-coglens-border">
                <Link
                  href="/"
                  className="flex items-center gap-0.5 select-none"
                >
                  <span className="text-[15px] font-semibold tracking-tight text-coglens-primary">
                    Cog
                  </span>
                  <span className="text-[15px] font-semibold tracking-tight text-coglens-muted">
                    Lens
                  </span>
                  <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-coglens-accent" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-1.5 text-coglens-secondary transition-colors hover:text-coglens-primary"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4">
                <ul className="flex flex-col gap-0.5">
                  {sidebarItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                            active
                              ? 'bg-coglens-card text-coglens-primary'
                              : 'text-coglens-secondary hover:bg-coglens-card/60 hover:text-coglens-primary'
                          }`}
                        >
                          {active && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-coglens-accent" />
                          )}
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              active
                                ? 'text-coglens-primary'
                                : 'text-coglens-muted'
                            }`}
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ──────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-coglens-border bg-coglens-surface px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-coglens-secondary transition-colors hover:text-coglens-primary"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-0.5 select-none">
            <span className="text-[15px] font-semibold tracking-tight text-coglens-primary">
              Cog
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-coglens-muted">
              Lens
            </span>
            <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-coglens-accent" />
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-coglens-bg">
          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

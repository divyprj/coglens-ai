'use client';

import { useState, useCallback } from 'react';
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

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const SidebarContent = (
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
                  onClick={closeMobile}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-coglens-card text-coglens-primary'
                      : 'text-coglens-secondary hover:bg-coglens-card/60 hover:text-coglens-primary'
                  }`}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
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

      {/* Bottom section */}
      <div className="shrink-0 border-t border-coglens-border px-5 py-4">
        <p className="text-[11px] text-coglens-muted">
          CogLens v0.1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button — rendered in DashboardLayout topbar */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-coglens-secondary transition-colors hover:text-coglens-primary lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col border-r border-coglens-border bg-coglens-surface h-screen sticky top-0">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={closeMobile}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-60 bg-coglens-surface border-r border-coglens-border lg:hidden"
            >
              {/* Close button */}
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-md p-1.5 text-coglens-secondary transition-colors hover:text-coglens-primary"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

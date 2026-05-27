'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  {
    label: 'GitHub',
    href: 'https://github.com/divyprj/coglens-ai',
    external: true,
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: 'smooth' });
        closeMobile();
      }
    },
    [closeMobile],
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled
            ? 'bg-coglens-bg/80 backdrop-blur-xl border-b border-coglens-border'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 select-none">
            <span className="text-[15px] font-semibold tracking-tight text-coglens-primary">
              Cog
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-coglens-muted">
              Lens
            </span>
            <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-coglens-accent" />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[13px] text-coglens-secondary transition-colors hover:text-coglens-primary"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                ) : (
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="text-[13px] text-coglens-secondary transition-colors hover:text-coglens-primary"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="hidden rounded-md bg-coglens-primary px-3.5 py-1.5 text-[13px] font-medium text-coglens-bg transition-opacity hover:opacity-90 md:inline-flex"
            >
              Upload PDF
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-coglens-secondary transition-colors hover:text-coglens-primary md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={closeMobile}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 flex w-72 flex-col bg-coglens-surface border-l border-coglens-border md:hidden"
            >
              {/* Panel header */}
              <div className="flex h-14 items-center justify-between px-6 border-b border-coglens-border">
                <span className="text-[15px] font-semibold tracking-tight text-coglens-primary">
                  CogLens
                </span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-md p-1.5 text-coglens-secondary transition-colors hover:text-coglens-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Panel links */}
              <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMobile}
                        className="flex items-center justify-between rounded-md px-3 py-2.5 text-[14px] text-coglens-secondary transition-colors hover:bg-coglens-card hover:text-coglens-primary"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          handleSmoothScroll(e, link.href);
                          closeMobile();
                        }}
                        className="flex items-center rounded-md px-3 py-2.5 text-[14px] text-coglens-secondary transition-colors hover:bg-coglens-card hover:text-coglens-primary"
                      >
                        {link.label}
                      </a>
                    )}
                  </div>
                ))}

                <div className="mt-4 border-t border-coglens-border pt-4">
                  <Link
                    href="/upload"
                    onClick={closeMobile}
                    className="flex items-center justify-center rounded-md bg-coglens-primary px-4 py-2.5 text-[14px] font-medium text-coglens-bg transition-opacity hover:opacity-90"
                  >
                    Upload PDF
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

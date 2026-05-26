import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-coglens-border bg-coglens-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row sm:gap-4">
        {/* Left — branding + tagline */}
        <div className="flex flex-col items-center gap-1.5 sm:items-start">
          <div className="flex items-center gap-0.5 select-none">
            <span className="text-[14px] font-semibold tracking-tight text-coglens-primary">
              Cog
            </span>
            <span className="text-[14px] font-semibold tracking-tight text-coglens-muted">
              Lens
            </span>
            <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-coglens-accent" />
          </div>
          <p className="text-[12px] text-coglens-muted">
            Built for Cog Culture Assessment
          </p>
        </div>

        {/* Right — links + copyright */}
        <div className="flex flex-col items-center gap-3 sm:items-end">
          <div className="flex items-center gap-5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] text-coglens-secondary transition-colors hover:text-coglens-primary"
            >
              GitHub
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="#"
              className="text-[12px] text-coglens-secondary transition-colors hover:text-coglens-primary"
            >
              Documentation
            </a>
          </div>
          <p className="text-[11px] text-coglens-muted">
            &copy; {year} CogLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

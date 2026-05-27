export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-coglens-border bg-coglens-bg">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-center">
          {/* Left — branding */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-0.5 select-none">
              <span className="text-[14px] font-semibold tracking-tight text-coglens-primary">
                Cog
              </span>
              <span className="text-[14px] font-semibold tracking-tight text-coglens-muted">
                Lens
              </span>
              <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-coglens-accent" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-coglens-muted/50">
              <span>Built for Cog Culture</span>
              <span className="text-coglens-border/60">•</span>
              <span>&copy; {year}</span>
            </div>
          </div>

          {/* Right — product descriptor */}
          <p className="text-[11px] tracking-wide text-coglens-muted/50 sm:text-right">
            AI-powered verification platform
          </p>
        </div>
      </div>
    </footer>
  );
}

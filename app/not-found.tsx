import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-coglens-bg px-6">
      <div className="text-center max-w-md">
        {/* Large 404 */}
        <h1 className="text-[8rem] font-semibold leading-none tracking-tighter text-coglens-card select-none sm:text-[10rem]">
          404
        </h1>

        {/* Message */}
        <h2 className="mt-2 text-xl font-medium text-coglens-primary">
          Page not found
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-coglens-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Return home */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-coglens-border bg-coglens-surface px-5 py-2.5 text-sm font-medium text-coglens-primary transition-colors hover:bg-coglens-card"
        >
          <ArrowLeft className="h-4 w-4" />
          Return home
        </Link>
      </div>
    </div>
  );
}

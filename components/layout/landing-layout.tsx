import Navbar from '@/components/navigation/navbar';
import Footer from '@/components/layout/footer';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-coglens-bg overflow-x-hidden">
      {/* Ambient radial glow — subtle depth behind hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-200px] z-0 h-[600px] w-[800px] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.015) 0%, transparent 70%)',
        }}
      />

      <Navbar />
      <main className="relative z-10 flex-1 pt-14">{children}</main>
      <Footer />
    </div>
  );
}

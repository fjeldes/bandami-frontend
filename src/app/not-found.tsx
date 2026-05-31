import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-6">
      <main className="text-center max-w-md">
        <span className="material-symbols-outlined text-[80px] text-outline mb-4">search_off</span>
        <h1 className="font-heading text-display-lg text-on-surface mb-2">404</h1>
        <p className="text-body-lg text-on-surface-variant mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">Go Home</Link>
          <Link href="/dashboard" className="border border-outline-variant text-on-surface font-bold px-6 py-3 rounded-xl hover:bg-surface-container-low transition-colors">Dashboard</Link>
        </div>
      </main>
    </div>
  );
}

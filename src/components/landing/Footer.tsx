import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-8 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 mt-12">
      <div className="font-bold text-slate-700 dark:text-slate-300">
        Bandami
      </div>
      <div className="flex gap-6">
        <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
        <a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="mailto:hello@bandami.com">Support</a>
      </div>
      <div>&copy; 2026 Bandami. All rights reserved.</div>
    </footer>
  );
}

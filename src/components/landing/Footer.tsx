import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-base px-gutter flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low border-t border-outline-variant text-label-sm text-on-surface-variant mt-12">
      <div className="text-body-md font-bold text-on-surface-variant">
        Bandami
      </div>
      <div className="flex gap-4">
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        <a className="hover:text-primary transition-colors" href="mailto:hello@bandami.com">Support</a>
      </div>
      <div>&copy; 2026 Bandami. All rights reserved.</div>
    </footer>
  );
}

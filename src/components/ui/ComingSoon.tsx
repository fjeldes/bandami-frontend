export function ComingSoon({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <span className="material-symbols-outlined text-[64px] text-outline mb-6">{icon}</span>
      <h1 className="text-headline-lg font-bold text-on-surface mb-3">{title}</h1>
      <p className="text-body-md text-on-surface-variant max-w-md mb-2">
        This section is under development and will be available soon.
      </p>
      <p className="text-label-sm text-on-surface-variant/60">
        We&apos;re curating high-quality IELTS {title.toLowerCase()} materials to give you the best practice experience.
      </p>
    </div>
  );
}

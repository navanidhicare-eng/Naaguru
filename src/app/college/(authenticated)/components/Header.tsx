export function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-8">
      <div className="flex items-center gap-2 text-neutral-muted text-xs font-medium">
        <span className="material-symbols-outlined text-[18px] text-primary" id="breadcrumbIcon">dashboard</span>
        <span>Apex Portal</span>
        <span className="text-neutral-muted/40">/</span>
        <span className="text-on-surface font-semibold" id="breadcrumbTitle">College Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-muted text-[18px]">search</span>
          <input 
            type="text" 
            id="globalSearchInput" 
            placeholder="Search students, staff, batches..." 
            className="w-full bg-surface-canvas text-xs pl-9 pr-3 py-2 rounded-lg border border-border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Notification Bell */}
        <button className="w-9 h-9 rounded-lg border border-border-subtle bg-surface-canvas hover:bg-surface-container flex items-center justify-center text-neutral-muted hover:text-primary relative transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-container"></span>
        </button>

        {/* Quick Action Button */}
        <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-colors">
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>+ Add Lead</span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-border-subtle">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            AP
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-on-surface">Dr. A. Prabhakar</span>
            <span className="text-[10px] text-neutral-muted">Principal &amp; Director</span>
          </div>
        </div>
      </div>
    </header>
  );
}

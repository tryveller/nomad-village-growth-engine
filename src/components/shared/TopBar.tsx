export default function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div>
        <h1 className="text-sm font-medium text-muted-foreground">
          Finding Nomad Villages
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Phase 0 — Setup</span>
      </div>
    </header>
  );
}
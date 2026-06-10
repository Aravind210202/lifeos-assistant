export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background animate-pulse">
      {/* Sidebar skeleton */}
      <div className="w-[280px] border-r border-border bg-background p-4 space-y-6">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-md bg-white/10" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>

        {/* Menu items */}
        <div className="space-y-2 px-2">
          <div className="h-10 w-full rounded-lg bg-white/10" />
          <div className="h-10 w-full rounded-lg bg-white/10" />
          <div className="h-10 w-full rounded-lg bg-white/10" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {/* Content blocks */}
        <div className="h-12 w-48 rounded-lg bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 rounded-xl bg-white/10" />
          <div className="h-32 rounded-xl bg-white/10" />
          <div className="h-32 rounded-xl bg-white/10" />
        </div>
        <div className="h-64 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

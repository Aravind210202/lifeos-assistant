import { useIsMobile } from "@/hooks/useMobile";
import { MODULE_COLORS } from "@/lib/moduleColors";
import { LayoutDashboard, BarChart3, FileText, Target, Briefcase, Brain, Zap, Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", color: MODULE_COLORS.dashboard },
  { icon: FileText, label: "Reminders", path: "/reminders", color: MODULE_COLORS.reminders },
  { icon: FileText, label: "Notes", path: "/notes", color: MODULE_COLORS.notes },
  { icon: BarChart3, label: "Finance", path: "/finance", color: MODULE_COLORS.finance },
  { icon: Target, label: "Goals", path: "/goals", color: MODULE_COLORS.goals },
  { icon: Briefcase, label: "Job Applications", path: "/jobs", color: MODULE_COLORS.jobs },
  { icon: Brain, label: "Personal Memory", path: "/memory", color: MODULE_COLORS.memory },
  { icon: Zap, label: "AI Assistant", path: "/ai-assistant", color: MODULE_COLORS.ai },
  { icon: Settings, label: "Settings", path: "/settings", color: "#64748b" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl bg-black/40 border-r border-white/20 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h1 className="text-xl font-bold text-foreground">LifeOS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-white/10 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10"
                      : "text-foreground hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <p className="text-xs text-muted-foreground">LifeOS Assistant v1.0</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/20 backdrop-blur-xl bg-black/20 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">LifeOS</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default DashboardLayout;

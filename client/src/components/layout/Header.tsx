import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Home,
  Radio,
  Lock,
  Compass,
  Settings,
  User,
  LogOut,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  // Don't show header on auth page or full-screen reader
  if (location === "/auth" || location === "/login" || location.startsWith("/ebook-reader")) {
    return null;
  }

  // Core 4 Consolidated Navigation Tabs
  const NAV_TABS = [
    { href: "/", label: "Home", icon: Home, description: "Compose & Check-in" },
    { href: "/feed", label: "Feed", icon: Compass, description: "Public Whispers" },
    { href: "/resonance", label: "Resonance", icon: Radio, description: "1:1 Live Mood Match" },
    { href: "/sanctuary", label: "Sanctuary", icon: Lock, description: "Personal Private Vault" },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0A0A0C]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Moon className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                Nocturne
              </span>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = location === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-white/[0.08] text-white shadow-sm border border-white/10"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons: Standardized Settings & User Profile */}
          <div className="flex items-center gap-3">
            {/* Standardized Settings Gear Icon */}
            <Link
              href="/settings"
              className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0 hover:bg-white/10">
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-tr from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
                      <User className="h-4 w-4 text-purple-300" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#0E0E14] border-white/10 text-white shadow-2xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">
                        {user.displayName || user.anonymousHandle || user.username || "Night Wanderer"}
                      </p>
                      <p className="text-xs leading-none text-zinc-500">
                        {user.email || "Anonymous Midnight Soul"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
                    <Link href="/profile" className="flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile & Badges</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
                    <Link href="/settings" className="flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer focus:bg-rose-500/10 focus:text-rose-300"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Fade to Sleep (Log out)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white text-xs px-3.5 h-8">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar: Fixed flex-nowrap bug, smooth horizontal scroll */}
        <div className="md:hidden border-t border-white/[0.04] bg-[#0A0A0C]/95 backdrop-blur-xl px-2 py-1.5">
          <nav className="flex items-center gap-1.5 overflow-x-auto flex-nowrap scrollbar-none py-0.5 px-1">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = location === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 shrink-0 min-w-[76px] flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : "text-zinc-400 hover:text-zinc-200 bg-white/[0.02] border border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}

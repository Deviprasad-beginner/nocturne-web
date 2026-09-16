import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Moon, User, Settings, LogOut } from "lucide-react";
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


    const navLinks = [
        { href: "/", label: "Dashboard" },
        { href: "/library", label: "Library" },
        { href: "/night-circles", label: "Circles" },
        { href: "/starlit-speaker", label: "Spaces" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Moon className="h-6 w-6 text-purple-400" />
                        <span className="font-bold text-lg text-white hidden sm:inline-block">Nocturne</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-4">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-white ${location === link.href ? "text-white" : "text-gray-400"}`}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-900/50 border border-purple-500/30">
                                        <User className="h-4 w-4 text-purple-300" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-[#1a1b26] border-white/10 text-white" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.displayName || user.username}</p>
                                        <p className="text-xs leading-none text-gray-400">{user.email || "Nocturne User"}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer focus:bg-white/5 focus:text-white">
                                    <Link href="/profile" className="flex w-full items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
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
                                    className="text-red-400 hover:bg-white/5 hover:text-red-300 cursor-pointer focus:bg-white/5 focus:text-red-300"
                                    onClick={() => logoutMutation.mutate()}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/auth">
                            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

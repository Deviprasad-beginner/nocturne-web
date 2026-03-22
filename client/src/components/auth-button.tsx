import { Button } from "@/components/ui/button";
import { LogIn, Settings } from "lucide-react";
import { Link } from "wouter";
import { User } from "@shared/schema";

interface AuthButtonProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function AuthButton({ user, onLogin, onLogout }: AuthButtonProps) {
  return user ? (
    <div className="flex items-center gap-3">
      <Link href="/profile">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
            alt="User avatar"
            className="w-9 h-9 rounded-full border-2 border-indigo-400"
          />
          <span className="font-medium text-sm hidden sm:block">{user.displayName || user.username}</span>
        </div>
      </Link>
      <Link href="/settings">
        <button
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </Link>
    </div>
  ) : (
    <Button
      onClick={onLogin}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
    >
      <LogIn className="w-5 h-5 mr-2" />
      Sign In
    </Button>
  );
}
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { Link } from "wouter";
import { User } from "@shared/schema";

interface AuthButtonProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function AuthButton({ user, onLogin, onLogout }: AuthButtonProps) {
  return user ? (
    <div className="flex items-center space-x-4">
      <Link href="/profile">
        <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
            alt="User avatar"
            className="w-10 h-10 rounded-full border-2 border-indigo-400"
          />
          <span className="font-medium">{user.displayName || user.username}</span>
        </div>
      </Link>
      <Button
        onClick={onLogout}
        variant="ghost"
        className="glassmorphism px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
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
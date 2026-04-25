import { Moon, Heart, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              <span className="text-lg md:text-xl font-bold text-white">Nocturne</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              A digital sanctuary for night owls, deep thinkers, and authentic connections.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-white text-sm md:text-base">Quick Links</h3>
            <div className="space-y-2 text-xs md:text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">Community</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">Guidelines</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">Support</a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-white text-sm md:text-base">Explore</h3>
            <div className="space-y-2 text-xs md:text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">3AM Founder</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">Starlit Speaker</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">Moon Messenger</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block min-h-[32px] flex items-center">All Categories</a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-white text-sm md:text-base">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-gray-400 text-xs md:text-sm flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
            <span>for the night community</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
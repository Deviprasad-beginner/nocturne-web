import { Moon, Heart, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Moon className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Nocturne</span>
            </div>
            <p className="text-gray-400 text-sm">
              A digital sanctuary for night owls, deep thinkers, and authentic connections.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">Community</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">Guidelines</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">Support</a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Explore</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">3AM Founder</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">Starlit Speaker</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">Moon Messenger</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors block">All Categories</a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span>for the night community</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
import { Link } from "wouter";
import { Moon, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-[#0a0f1d]/80 backdrop-blur-xl border-t border-white/10 text-gray-400 py-12 relative z-10 mt-auto">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Branding Column */}
                <div className="md:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 text-white">
                        <Moon className="w-5 h-5 text-indigo-400" />
                        <span className="font-bold text-lg tracking-wide">Nocturne</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        The night is unwritten. A safe, anonymous ecosystem for deep thoughts and authentic connections.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-indigo-400 transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-indigo-400 transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-indigo-400 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Platform Column */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Platform</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/resonance" className="hover:text-indigo-300 transition-colors">Resonance 1:1</Link></li>
                        <li><Link href="/about" className="hover:text-indigo-300 transition-colors">About Us</Link></li>
                        <li><Link href="/about" className="hover:text-indigo-300 transition-colors">Our Vision</Link></li>
                        <li><Link href="/contact" className="hover:text-indigo-300 transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/privacy-policy" className="hover:text-indigo-300 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-indigo-300 transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy-policy" className="hover:text-indigo-300 transition-colors">Cookie Policy</Link></li>
                    </ul>
                </div>

                {/* Community Column */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Community</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/guidelines" className="hover:text-indigo-300 transition-colors">Guidelines</Link></li>
                        <li><Link href="/help" className="hover:text-indigo-300 transition-colors">Help Center</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
                <p>© {new Date().getFullYear()} Nocturne. All rights reserved.</p>
                <p className="mt-2 md:mt-0">Designed in the dark.</p>
            </div>
        </footer>
    );
}
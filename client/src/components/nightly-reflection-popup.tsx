import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export function NightlyReflectionPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [, setLocation] = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        // Only show if user is logged in and hasn't seen it this session
        if (!user) return;

        const hasSeen = sessionStorage.getItem("has_seen_nightly_reflection_popup");
        if (!hasSeen) {
            // Delay showing the popup so it feels like a gentle invitation
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem("has_seen_nightly_reflection_popup", "true");
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-[4px]"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a10]/95 p-8 text-center shadow-2xl backdrop-blur-xl"
                        style={{
                            boxShadow: "0 20px 80px -10px rgba(129, 140, 248, 0.25)"
                        }}
                    >
                        {/* Ambient glow inside card */}
                        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-[50px]" />
                        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-purple-500/10 blur-[50px]" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                <Sparkles className="h-8 w-8 text-indigo-400" />
                            </div>

                            <h2 className="mb-3 text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: "-0.02em" }}>
                                Ready for your Nightly Reflection?
                            </h2>
                            
                            <p className="mb-8 text-sm leading-relaxed text-slate-300">
                                Take a breath. Your nightly reflection awaits. A quiet space to untangle your thoughts before sleep.
                            </p>

                            <div className="flex w-full flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        // Slight delay before routing for smoothness
                                        setTimeout(() => setLocation("/nightly-reflection"), 150);
                                    }}
                                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-500 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-400 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)]"
                                >
                                    Begin Reflection
                                </button>
                                
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                                >
                                    Fade into the night (Later)
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

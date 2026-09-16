import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { Sparkles, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const MOON_ICONS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌕", "🌕", "🌕"];
const MOON_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Luminous Moon",
  "Radiant Moon",
  "Supermoon"
];

export function MoonPhaseHeader() {
  const { user } = useAuth();
  
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/v1/users/check-in");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  // Automatically check in when the component mounts (Zero-Click Awareness)
  useEffect(() => {
    if (user && user.id) {
      checkInMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  const phaseLevel = Math.min(Math.max(user.moonPhaseLevel || 0, 0), 7);
  const stars = user.permanentStars || 0;
  
  const moonIcon = MOON_ICONS[phaseLevel > 4 ? 4 : phaseLevel]; 
  // Just for visual representation, scale opacity/glow for higher levels
  const glowLevel = phaseLevel / 7;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-indigo-950/40 to-black/80 border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 backdrop-blur-md shadow-2xl"
    >
      {/* Ambient background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none transition-all duration-1000"
        style={{ opacity: 0.3 + (glowLevel * 0.7), transform: `translate(-50%, -50%) scale(${1 + glowLevel})` }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Moon Icon with glowing effect */}
          <motion.div
            key={phaseLevel}
            initial={{ scale: 0.8, rotate: -15, filter: 'blur(10px)' }}
            animate={{ scale: 1, rotate: 0, filter: 'blur(0px)' }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative flex items-center justify-center w-24 h-24 rounded-full bg-black/40 border border-white/5 shadow-inner"
          >
            <span 
              className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              style={{ textShadow: `0 0 ${10 + (glowLevel * 30)}px rgba(255, 255, 255, ${0.5 + glowLevel/2})` }}
            >
              {moonIcon}
            </span>
            {phaseLevel >= 4 && (
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-indigo-400/30"
                />
            )}
          </motion.div>

          {/* Text Info */}
          <div>
            <h2 className="text-2xl font-light text-white tracking-wide flex items-center gap-2">
              {MOON_NAMES[phaseLevel]}
              {phaseLevel >= 7 && <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}
            </h2>
            <p className="text-indigo-200/70 text-sm mt-1 max-w-[250px]">
              {phaseLevel === 0 ? "The night is dark. Check in daily to build your moon phase." : 
               phaseLevel === 7 ? "Your moon shines bright. Maintain your streak to collect permanent stars." : 
               "Your presence is felt. The moon waxes with each passing night."}
            </p>
          </div>
        </div>

        {/* Permanent Stars */}
        <div className="flex flex-col items-center sm:items-end gap-2 bg-black/30 p-4 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Permanent Stars</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-3xl font-light text-white">{stars}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

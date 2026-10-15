import { Sparkles, Moon, Compass, Feather, ArrowRight } from "lucide-react";
import type { WhisperMood } from "@shared/schema";

export interface MidnightPromptItem {
  id: string;
  prompt: string;
  suggestedMood: WhisperMood;
  category: string;
  icon: string;
}

export const MIDNIGHT_PROMPTS: MidnightPromptItem[] = [
  {
    id: "lonely-echo",
    prompt: "What thought keeps circling in your mind while the rest of the city sleeps?",
    suggestedMood: "lonely",
    category: "Solitude",
    icon: "🌙",
  },
  {
    id: "restless-energy",
    prompt: "What unwritten ambition or quiet fear is preventing your eyes from closing?",
    suggestedMood: "restless",
    category: "Restlessness",
    icon: "⚡",
  },
  {
    id: "nostalgic-memory",
    prompt: "Which memory from years ago suddenly felt closer to you tonight?",
    suggestedMood: "nostalgic",
    category: "Echoes",
    icon: "📼",
  },
  {
    id: "grateful-glimmer",
    prompt: "Name one tiny, unnoticed kindness that made you feel human today.",
    suggestedMood: "grateful",
    category: "Gratitude",
    icon: "✨",
  },
  {
    id: "inspired-dawn",
    prompt: "If you had no fear of judgment tomorrow, what would you create?",
    suggestedMood: "inspired",
    category: "Sparks",
    icon: "💡",
  },
  {
    id: "anxious-weight",
    prompt: "What heavy weight are you carrying tonight that you need to gently release into the dark?",
    suggestedMood: "anxious",
    category: "Vulnerability",
    icon: "🍃",
  },
];

interface MidnightPromptsProps {
  onSelectPrompt: (promptText: string, mood: WhisperMood) => void;
  className?: string;
}

export function MidnightPrompts({ onSelectPrompt, className = "" }: MidnightPromptsProps) {
  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-[#0d0d12]/80 border border-white/5 backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-semibold text-white tracking-wide">Break the Midnight Silence</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
        The realm is quiet tonight. Be the first night owl to send a ripple across the void. Select a prompt below to inspire your whisper:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {MIDNIGHT_PROMPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPrompt(item.prompt, item.suggestedMood)}
            className="group text-left p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between hover:translate-y-[-2px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                <span>{item.icon}</span>
                <span>{item.category}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.05] capitalize group-hover:border-indigo-500/30 group-hover:text-white transition-colors">
                {item.suggestedMood}
              </span>
            </div>

            <p className="text-sm text-zinc-200 group-hover:text-white transition-colors font-medium mb-3">
              "{item.prompt}"
            </p>

            <div className="flex items-center text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
              <span>Whisper this</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

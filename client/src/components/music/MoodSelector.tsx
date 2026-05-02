import { useMusic } from "@/context/MusicContext";

const moods = [
    { id: "focus",      label: "Focus",      glyph: "◎" },
    { id: "relax",      label: "Relax",      glyph: "∿" },
    { id: "lonely",     label: "Lonely",     glyph: "◗" },
    { id: "deep-night", label: "Deep Night", glyph: "☽" },
    { id: "coding",     label: "Coding",     glyph: "⌨" },
];

export function MoodSelector() {
    const { mood, setMood } = useMusic();

    return (
        <div className="w-full">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-4 font-medium">
                Tune your mood
            </p>
            <div className="flex flex-wrap gap-2">
                {moods.map((m) => {
                    const active = mood === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => setMood(active ? null : m.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                border transition-all duration-300
                                ${active
                                    ? "border-white/20 bg-white/8 text-white"
                                    : "border-white/6 bg-transparent text-white/35 hover:text-white/60 hover:border-white/12"
                                }
                            `}
                            style={active ? { backdropFilter: "blur(12px)" } : {}}
                        >
                            <span
                                className="text-xs"
                                style={{ color: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}
                            >
                                {m.glyph}
                            </span>
                            {m.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, Moon, Brain, Heart, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";

type Intention = "learn" | "feel" | "think" | "sleep";

export default function ReadCard() {
    const [, setLocation] = useLocation();
    const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null);

    const intentions = [
        {
            id: "learn" as Intention,
            icon: Brain,
            label: "Learn",
            description: "Clean font, neutral contrast, faster scroll",
            color: "from-blue-500 to-cyan-500",
        },
        {
            id: "feel" as Intention,
            icon: Heart,
            label: "Feel",
            description: "Soft font, warmer background",
            color: "from-pink-500 to-rose-500",
        },
        {
            id: "think" as Intention,
            icon: Moon,
            label: "Think",
            description: "Serif font, wider line spacing",
            color: "from-purple-500 to-indigo-500",
        },
        {
            id: "sleep" as Intention,
            icon: Bed,
            label: "Sleep",
            description: "Low contrast, slow scroll",
            color: "from-gray-500 to-slate-600",
        },
    ];

    const handleIntentionSelect = (intention: Intention) => {
        setSelectedIntention(intention);
        // Proceed to mode selection or bookshelf
        setTimeout(() => {
            setLocation(`/read-alone?intention=${intention}`);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <BookOpen className="w-12 h-12 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Read Card
                    </h1>
                    <p className="text-xl text-gray-400 italic">
                        "Why are you reading tonight?"
                    </p>
                </div>

                {/* Intention Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {intentions.map((intention) => {
                        const IconComponent = intention.icon;
                        return (
                            <button
                                key={intention.id}
                                onClick={() => handleIntentionSelect(intention.id)}
                                className={`
                  group relative p-8 rounded-2xl border border-gray-700/50
                  bg-gradient-to-br from-gray-800/50 to-gray-900/50
                  hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20
                  transition-all duration-300 text-left
                  ${selectedIntention === intention.id ? 'ring-2 ring-indigo-500' : ''}
                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`
                      w-14 h-14 rounded-xl bg-gradient-to-br ${intention.color}
                      flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-300
                    `}
                                    >
                                        <IconComponent className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-semibold mb-2">{intention.label}</h3>
                                        <p className="text-gray-400 text-sm">{intention.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Back Button */}
                <div className="mt-12 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => setLocation("/")}
                        className="text-gray-400 hover:text-white"
                    >
                        ← Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

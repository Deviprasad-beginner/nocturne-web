import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
    BookOpen,
    Brain,
    Heart,
    Moon,
    Bed,
    Upload,
    FileText,
    Type,
    Shield,
    Clock,
    ArrowRight,
    ArrowLeft,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { ReadingMode } from "@/lib/reading-modes";
import { READING_MODES } from "@/lib/reading-modes";

type Step = "mode" | "content" | "confirm";

export default function ReadCard() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Wizard state
    const [step, setStep] = useState<Step>("mode");
    const [selectedMode, setSelectedMode] = useState<ReadingMode | null>(null);
    const [isEphemeral, setIsEphemeral] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // Content state
    const [inputMode, setInputMode] = useState<"text" | "file">("text");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Create read mutation
    const createRead = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/v1/reads", {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create read");
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/reads/mine"] });
            setLocation(`/reader/${data.id}`);
        },
    });

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (
                f &&
                (f.type === "application/pdf" || f.name.endsWith(".txt"))
            ) {
                setFile(f);
                if (!title) setTitle(f.name.replace(/\.(pdf|txt)$/, ""));
            }
        },
        [title]
    );
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            if (!title) setTitle(f.name.replace(/\.(pdf|txt)$/, ""));
        }
    };

    // Submit
    const handleSubmit = () => {
        if (!selectedMode || !confirmed) return;
        const formData = new FormData();
        formData.append("title", title || "Untitled");
        if (author) formData.append("author", author);
        formData.append("intention", selectedMode);
        formData.append("isEphemeral", String(isEphemeral));
        if (inputMode === "file" && file) {
            formData.append("file", file);
        } else {
            formData.append("content", content);
        }
        createRead.mutate(formData);
    };

    const canProceedContent =
        inputMode === "file" ? !!file && !!title : content.trim().length > 0 && !!title;

    // Mode card data
    const modes = [
        {
            id: "learn" as ReadingMode,
            icon: Brain,
            gradient: "from-sky-500 to-blue-600",
            border: "border-sky-500/40",
            tagline: "Clarity · Speed · Retention",
        },
        {
            id: "feel" as ReadingMode,
            icon: Heart,
            gradient: "from-amber-500 to-orange-600",
            border: "border-amber-500/40",
            tagline: "Emotion · Warmth · Immersion",
        },
        {
            id: "think" as ReadingMode,
            icon: Moon,
            gradient: "from-violet-500 to-indigo-600",
            border: "border-violet-500/40",
            tagline: "Reflection · Depth · Stillness",
        },
        {
            id: "sleep" as ReadingMode,
            icon: Bed,
            gradient: "from-slate-500 to-gray-700",
            border: "border-slate-600/40",
            tagline: "Calm · Slow · Release",
        },
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-500" />
                    <p className="text-gray-400">Sign in to enter the reading room</p>
                    <Button onClick={() => setLocation("/auth")}>Sign In</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white overflow-auto">
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* ─── STEP 1  ·  MODE SELECTION ─── */}
                {step === "mode" && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-10">
                            <BookOpen className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Read Card
                            </h1>
                            <p className="text-gray-400 italic text-lg">
                                "Why are you reading tonight?"
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            {modes.map((m) => {
                                const cfg = READING_MODES[m.id];
                                const Icon = m.icon;
                                const isSelected = selectedMode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedMode(m.id);
                                            setTimeout(() => setStep("content"), 250);
                                        }}
                                        className={`group relative p-7 rounded-2xl text-left transition-all duration-300
                      border ${isSelected ? `${m.border} ring-2 ring-indigo-500/60` : "border-white/5"}
                      bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10
                      hover:shadow-lg hover:shadow-indigo-500/10`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient}
                          flex items-center justify-center shrink-0
                          group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold mb-1">{cfg.label}</h3>
                                                <p className="text-sm text-gray-500 mb-2">{cfg.description}</p>
                                                <p className="text-xs text-gray-600">{m.tagline}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Link to existing bookshelf */}
                        <div className="mt-10 flex justify-between">
                            <Button variant="ghost" onClick={() => setLocation("/")} className="text-gray-500">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Home
                            </Button>
                            <Button variant="ghost" onClick={() => setLocation("/read-alone")} className="text-gray-500">
                                My Bookshelf <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2  ·  CONTENT INPUT ─── */}
                {step === "content" && selectedMode && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Button variant="ghost" size="sm" onClick={() => setStep("mode")}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-xl font-semibold">
                                Paste your text
                                <span className="text-gray-500 font-normal ml-2">
                                    — {READING_MODES[selectedMode].label} mode
                                </span>
                            </h2>
                        </div>

                        {/* Input mode tabs */}
                        <div className="flex gap-2">
                            <Button
                                variant={inputMode === "text" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setInputMode("text")}
                                className="gap-2"
                            >
                                <Type className="w-4 h-4" /> Paste Text
                            </Button>
                            <Button
                                variant={inputMode === "file" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setInputMode("file")}
                                className="gap-2"
                            >
                                <Upload className="w-4 h-4" /> Upload File
                            </Button>
                        </div>

                        {/* Text area */}
                        {inputMode === "text" && (
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste your text here…"
                                className="bg-gray-900/50 border-gray-700 min-h-[260px] text-base leading-relaxed"
                            />
                        )}

                        {/* File drop */}
                        {inputMode === "file" && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
                  ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-gray-700 hover:border-gray-500"}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {file ? (
                                    <div className="space-y-2">
                                        <FileText className="w-10 h-10 mx-auto text-indigo-400" />
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="w-10 h-10 mx-auto text-gray-500" />
                                        <p className="text-sm">Drop PDF or TXT here, or click to browse</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {/* Title / Author */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter title…"
                                    className="bg-gray-900/50 border-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Author (optional)</label>
                                <Input
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Author name…"
                                    className="bg-gray-900/50 border-gray-700"
                                />
                            </div>
                        </div>

                        {/* Storage toggle */}
                        <Card className="p-5 bg-gray-900/40 border-gray-700/50 space-y-4">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="font-medium">Storage Mode</span>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsEphemeral(false)}
                                    className={`p-4 rounded-xl border text-left transition-all duration-200
                    ${!isEphemeral ? "border-indigo-500/60 bg-indigo-500/10" : "border-gray-700 hover:border-gray-600"}`}
                                >
                                    <p className="font-medium mb-1">Private</p>
                                    <p className="text-xs text-gray-400">Saved securely in your account</p>
                                </button>
                                <button
                                    onClick={() => setIsEphemeral(true)}
                                    className={`p-4 rounded-xl border text-left transition-all duration-200
                    ${isEphemeral ? "border-amber-500/60 bg-amber-500/10" : "border-gray-700 hover:border-gray-600"}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                        <p className="font-medium">Ephemeral</p>
                                    </div>
                                    <p className="text-xs text-gray-400">Auto-deleted after 24 hours</p>
                                </button>
                            </div>
                        </Card>

                        <Button
                            disabled={!canProceedContent}
                            onClick={() => setStep("confirm")}
                            className="w-full gap-2"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* ─── STEP 3  ·  CONFIRM & START ─── */}
                {step === "confirm" && selectedMode && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Button variant="ghost" size="sm" onClick={() => setStep("content")}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-xl font-semibold">Confirm & Start Reading</h2>
                        </div>

                        {/* Summary */}
                        <Card className="p-6 bg-gray-900/40 border-gray-700/50 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Mode</span>
                                <span className="capitalize font-medium">{selectedMode}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Title</span>
                                <span className="font-medium truncate ml-4">{title || "Untitled"}</span>
                            </div>
                            {author && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Author</span>
                                    <span>{author}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Storage</span>
                                <span className={isEphemeral ? "text-amber-400" : "text-indigo-400"}>
                                    {isEphemeral ? "Ephemeral (24h)" : "Private"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Content</span>
                                <span>
                                    {inputMode === "file"
                                        ? file?.name
                                        : `${content.split(/\s+/).length} words`}
                                </span>
                            </div>
                        </Card>

                        {/* Legal confirmation */}
                        <button
                            onClick={() => setConfirmed(!confirmed)}
                            className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200
                ${confirmed ? "border-green-500/60 bg-green-500/10" : "border-gray-700 hover:border-gray-600"}`}
                        >
                            <div
                                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5
                  ${confirmed ? "bg-green-500 border-green-500" : "border-gray-500"}`}
                            >
                                {confirmed && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                I confirm I have the right to use this text. This content is private and not shared.
                            </p>
                        </button>

                        <Button
                            disabled={!confirmed || createRead.isPending}
                            onClick={handleSubmit}
                            className="w-full gap-2"
                            size="lg"
                        >
                            {createRead.isPending ? "Preparing…" : "Enter Reading Room"}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* animation class */}
            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
      `}</style>
        </div>
    );
}

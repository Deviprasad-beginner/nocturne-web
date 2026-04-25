import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMoodAnalysis } from "@/hooks/useMoodAnalysis";
import { extractTextFromPdf, type PdfExtractResult } from "@/lib/pdf-extractor";
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
    Sparkles,
    Loader2,
    Eye,
    RefreshCw,
    ChevronRight,
    Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { ReadingMode } from "@/lib/reading-modes";
import { READING_MODES } from "@/lib/reading-modes";

// ─── Tab config ──────────────────────────────────────────────────────────────
type TabId = "intention" | "content" | "begin";

interface TabDef {
    id: TabId;
    label: string;
    sublabel: string;
    icon: React.ElementType;
}

const TABS: TabDef[] = [
    { id: "intention", label: "Intention", sublabel: "Why tonight?", icon: BookOpen },
    { id: "content",  label: "Content",   sublabel: "What to read",  icon: FileText },
    { id: "begin",    label: "Begin",      sublabel: "Enter the room", icon: Eye },
];

// ─── Mode palette ─────────────────────────────────────────────────────────────
const MODE_META = {
    learn: {
        icon: Brain,
        gradient: "from-sky-500 to-blue-600",
        glow: "shadow-sky-500/30",
        ring: "ring-sky-500/50",
        border: "border-sky-500/30",
        bg: "bg-sky-500/10",
        accent: "#38bdf8",
        tagline: "Clarity · Speed · Retention",
        sample: '"A decision tree is a flowchart-like structure in which each internal node represents a feature..."',
    },
    feel: {
        icon: Heart,
        gradient: "from-rose-500 to-orange-500",
        glow: "shadow-rose-500/30",
        ring: "ring-rose-500/50",
        border: "border-rose-500/30",
        bg: "bg-rose-500/10",
        accent: "#fb7185",
        tagline: "Emotion · Warmth · Immersion",
        sample: '"The rain came quietly, like an apology no one had asked for..."',
    },
    think: {
        icon: Moon,
        gradient: "from-violet-500 to-indigo-600",
        glow: "shadow-violet-500/30",
        ring: "ring-violet-500/50",
        border: "border-violet-500/30",
        bg: "bg-violet-500/10",
        accent: "#a78bfa",
        tagline: "Reflection · Depth · Stillness",
        sample: '"What does it mean to truly know something? Is certainty even possible?"',
    },
    sleep: {
        icon: Bed,
        gradient: "from-slate-500 to-gray-700",
        glow: "shadow-slate-500/20",
        ring: "ring-slate-500/40",
        border: "border-slate-600/30",
        bg: "bg-slate-600/10",
        accent: "#94a3b8",
        tagline: "Calm · Slow · Release",
        sample: '"Breathe. The house is quiet now. Let the words come slowly..."',
    },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReadCard() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabId>("intention");

    // Mode
    const [selectedMode, setSelectedMode] = useState<ReadingMode | null>(null);
    const [isEphemeral, setIsEphemeral] = useState(false);

    // Content
    const [inputMode, setInputMode] = useState<"text" | "file">("text");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [pastedText, setPastedText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // PDF extraction
    const [extracting, setExtracting] = useState(false);
    const [extractProgress, setExtractProgress] = useState(0);
    const [extractResult, setExtractResult] = useState<PdfExtractResult | null>(null);
    const [extractError, setExtractError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // The text that feeds mood analysis: pasted text OR extracted PDF text
    const analysisText = inputMode === "text" ? pastedText : (extractResult?.text ?? "");
    const { result: moodResult, isAnalyzing } = useMoodAnalysis(analysisText);

    // Auto-extract when file is chosen
    useEffect(() => {
        if (!file) {
            setExtractResult(null);
            setExtractError(null);
            setExtractProgress(0);
            return;
        }
        if (file.type === "application/pdf") {
            setExtracting(true);
            setExtractError(null);
            setExtractProgress(0);
            extractTextFromPdf(file, setExtractProgress)
                .then((res) => {
                    setExtractResult(res);
                    if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
                })
                .catch(() => setExtractError("Could not extract text from this PDF."))
                .finally(() => setExtracting(false));
        } else {
            // .txt
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setExtractResult({
                    text,
                    pageCount: 1,
                    wordCount: text.split(/\s+/).filter(Boolean).length,
                    estimatedReadMinutes: Math.max(1, Math.ceil(text.split(/\s+/).length / 200)),
                    preview: text.slice(0, 320) + (text.length > 320 ? "…" : ""),
                });
                if (!title) setTitle(file.name.replace(/\.txt$/i, ""));
            };
            reader.readAsText(file);
        }
    }, [file]);

    // Drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
    }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.type === "application/pdf" || f.name.endsWith(".txt"))) setFile(f);
    }, []);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    // Validation
    const canProceedToContent = !!selectedMode;
    const canProceedToBegin =
        inputMode === "text"
            ? pastedText.trim().length > 0 && !!title
            : !!extractResult && !!title;

    // Create read
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

    const handleSubmit = () => {
        if (!selectedMode || !confirmed) return;
        const formData = new FormData();
        formData.append("title", title || "Untitled");
        if (author) formData.append("author", author);
        formData.append("intention", selectedMode);
        formData.append("isEphemeral", String(isEphemeral));

        if (inputMode === "file" && extractResult) {
            // Send the extracted text (server already handles text; we avoid resending raw PDF)
            formData.append("content", extractResult.text);
        } else {
            formData.append("content", pastedText);
        }
        createRead.mutate(formData);
    };

    if (!user) {
        return (
            <div className="rc-shell">
                <div className="rc-gate">
                    <BookOpen className="rc-gate-icon" />
                    <p className="rc-gate-text">Sign in to enter the reading room</p>
                    <Button onClick={() => setLocation("/auth")}>Sign In</Button>
                </div>
                <style>{RC_STYLES}</style>
            </div>
        );
    }

    const tabIdx = TABS.findIndex(t => t.id === activeTab);

    return (
        <div className="rc-shell">
            <style>{RC_STYLES}</style>

            {/* ── Background orbs ─────────────────────────────────── */}
            <div className="rc-orb rc-orb-1" />
            <div className="rc-orb rc-orb-2" />

            <div className="rc-frame">
                {/* ══ LEFT RAIL ══════════════════════════════════════════ */}
                <aside className="rc-rail">
                    <div className="rc-rail-brand">
                        <BookOpen className="rc-rail-logo" />
                        <span className="rc-rail-title">Read Card</span>
                    </div>

                    <nav className="rc-rail-nav">
                        {TABS.map((tab, i) => {
                            const Icon = tab.icon;
                            const done =
                                (i === 0 && !!selectedMode) ||
                                (i === 1 && canProceedToBegin) ||
                                false;
                            const accessible =
                                i === 0 ||
                                (i === 1 && canProceedToContent) ||
                                (i === 2 && canProceedToBegin);
                            const active = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    className={`rc-rail-tab ${active ? "is-active" : ""} ${done ? "is-done" : ""} ${!accessible ? "is-locked" : ""}`}
                                    onClick={() => accessible && setActiveTab(tab.id)}
                                    disabled={!accessible}
                                    aria-current={active ? "step" : undefined}
                                >
                                    {/* connector line above */}
                                    {i > 0 && <span className={`rc-connector ${tabIdx >= i ? "is-lit" : ""}`} />}

                                    <span className="rc-rail-dot">
                                        {done
                                            ? <Check className="w-3.5 h-3.5" />
                                            : <Icon className="w-3.5 h-3.5" />}
                                        {active && <span className="rc-dot-pulse" />}
                                    </span>

                                    <span className="rc-rail-labels">
                                        <span className="rc-rail-label">{tab.label}</span>
                                        <span className="rc-rail-sub">{tab.sublabel}</span>
                                    </span>

                                    {active && <ChevronRight className="rc-rail-arrow" />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* bookshelf shortcut */}
                    <button className="rc-rail-shelf" onClick={() => setLocation("/read-alone")}>
                        <Library className="w-4 h-4" />
                        <span>My Bookshelf</span>
                    </button>
                </aside>

                {/* ══ MAIN PANEL ════════════════════════════════════════ */}
                <main className="rc-main">

                    {/* ── Tab 1 · Intention ─────────────────────────── */}
                    {activeTab === "intention" && (
                        <div className="rc-panel rc-anim">
                            <header className="rc-panel-head">
                                <h1 className="rc-panel-title">Why are you reading tonight?</h1>
                                <p className="rc-panel-sub">Your intention shapes everything — pace, feel, even the silence between words.</p>
                            </header>

                            <div className="rc-modes">
                                {(Object.keys(MODE_META) as ReadingMode[]).map((id) => {
                                    const meta = MODE_META[id];
                                    const cfg = READING_MODES[id];
                                    const Icon = meta.icon;
                                    const selected = selectedMode === id;

                                    return (
                                        <button
                                            key={id}
                                            className={`rc-mode-card ${selected ? "is-selected" : ""}`}
                                            style={{ "--mode-accent": meta.accent } as React.CSSProperties}
                                            onClick={() => {
                                                setSelectedMode(id);
                                                setTimeout(() => setActiveTab("content"), 320);
                                            }}
                                        >
                                            <div className={`rc-mode-icon-wrap bg-gradient-to-br ${meta.gradient}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>

                                            <div className="rc-mode-body">
                                                <div className="rc-mode-top">
                                                    <h3 className="rc-mode-name">{cfg.label}</h3>
                                                    {selected && <Check className="w-4 h-4 rc-mode-check" />}
                                                </div>
                                                <p className="rc-mode-desc">{cfg.description}</p>
                                                <p className="rc-mode-tagline">{meta.tagline}</p>
                                                <blockquote className="rc-mode-sample">{meta.sample}</blockquote>
                                            </div>

                                            {selected && <span className="rc-mode-glow" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="rc-panel-footer">
                                <Button variant="ghost" onClick={() => setLocation("/")} className="text-gray-500">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Home
                                </Button>
                                <Button
                                    disabled={!canProceedToContent}
                                    onClick={() => setActiveTab("content")}
                                    className="rc-btn-next"
                                >
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 2 · Content ───────────────────────────── */}
                    {activeTab === "content" && selectedMode && (
                        <div className="rc-panel rc-anim">
                            <header className="rc-panel-head">
                                <h1 className="rc-panel-title">What are you reading?</h1>
                                <p className="rc-panel-sub">
                                    Paste text or upload a PDF — we'll read the mood so you don't have to guess.
                                </p>
                            </header>

                            {/* Input Mode Toggle */}
                            <div className="rc-input-tabs">
                                <button
                                    className={`rc-input-tab ${inputMode === "text" ? "is-active" : ""}`}
                                    onClick={() => setInputMode("text")}
                                >
                                    <Type className="w-4 h-4" /> Paste Text
                                </button>
                                <button
                                    className={`rc-input-tab ${inputMode === "file" ? "is-active" : ""}`}
                                    onClick={() => setInputMode("file")}
                                >
                                    <Upload className="w-4 h-4" /> Upload File
                                </button>
                            </div>

                            {/* Text paste */}
                            {inputMode === "text" && (
                                <div className="rc-content-zone">
                                    <Textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        placeholder="Paste your text here… chapters, essays, stories, anything."
                                        className="rc-textarea"
                                    />
                                    {pastedText.trim().length > 0 && (
                                        <p className="rc-word-count">
                                            {pastedText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                                            &nbsp;·&nbsp;
                                            ~{Math.max(1, Math.ceil(pastedText.split(/\s+/).filter(Boolean).length / 200))} min read
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* File drop */}
                            {inputMode === "file" && (
                                <div className="rc-content-zone">
                                    <div
                                        className={`rc-dropzone ${isDragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => !file && fileInputRef.current?.click()}
                                    >
                                        {extracting ? (
                                            <div className="rc-extract-progress">
                                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                                <p className="text-sm text-gray-300 mt-3">Extracting text… {extractProgress}%</p>
                                                <div className="rc-progress-bar">
                                                    <div className="rc-progress-fill" style={{ width: `${extractProgress}%` }} />
                                                </div>
                                            </div>
                                        ) : file && extractResult ? (
                                            <div className="rc-file-card">
                                                <FileText className="w-8 h-8 text-indigo-400 mb-2" />
                                                <p className="font-medium text-sm">{file.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {extractResult.pageCount} pages · {extractResult.wordCount.toLocaleString()} words · ~{extractResult.estimatedReadMinutes} min
                                                </p>
                                                <div className="rc-file-actions">
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        onClick={(e) => { e.stopPropagation(); setShowPreview(!showPreview); }}
                                                        className="text-xs text-indigo-400"
                                                    >
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        {showPreview ? "Hide" : "Preview"} text
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        onClick={(e) => { e.stopPropagation(); setFile(null); setExtractResult(null); }}
                                                        className="text-xs text-gray-500"
                                                    >
                                                        <RefreshCw className="w-3 h-3 mr-1" /> Replace
                                                    </Button>
                                                </div>
                                                {showPreview && (
                                                    <div className="rc-preview-text">{extractResult.preview}</div>
                                                )}
                                            </div>
                                        ) : extractError ? (
                                            <div className="rc-drop-empty">
                                                <FileText className="w-8 h-8 text-red-400 mb-2" />
                                                <p className="text-sm text-red-400">{extractError}</p>
                                                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setExtractError(null); }}>Try again</Button>
                                            </div>
                                        ) : (
                                            <div className="rc-drop-empty">
                                                <Upload className="w-8 h-8 text-gray-500 mb-3" />
                                                <p className="text-sm text-gray-400 font-medium">Drop PDF or TXT here</p>
                                                <p className="text-xs text-gray-600 mt-1">or click to browse · Max 10 MB</p>
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
                                </div>
                            )}

                            {/* ── MOOD SUGGESTION BANNER ─────────────── */}
                            {(isAnalyzing || moodResult) && (
                                <div className={`rc-mood-banner ${isAnalyzing ? "is-loading" : ""}`}>
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                                            <span className="text-sm text-gray-400">Reading the mood of your text…</span>
                                        </>
                                    ) : moodResult ? (
                                        <>
                                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                                            <div className="rc-mood-body">
                                                <p className="rc-mood-text">
                                                    <span className="rc-mood-mode">{READING_MODES[moodResult.suggestedMode].label}</span>
                                                    {" "}mode suggested
                                                    <span className="rc-mood-conf"> · {moodResult.confidence}% match</span>
                                                </p>
                                                <p className="rc-mood-reason">{moodResult.reasoning}</p>
                                            </div>
                                            {moodResult.suggestedMode !== selectedMode && (
                                                <button
                                                    className="rc-mood-use"
                                                    onClick={() => setSelectedMode(moodResult.suggestedMode)}
                                                >
                                                    Use this
                                                </button>
                                            )}
                                            {moodResult.suggestedMode === selectedMode && (
                                                <span className="rc-mood-match"><Check className="w-3 h-3 mr-1 inline" />Matches your choice</span>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="rc-meta-grid">
                                <div>
                                    <label className="rc-label">Title *</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Give it a name…"
                                        className="rc-input"
                                    />
                                </div>
                                <div>
                                    <label className="rc-label">Author <span className="text-gray-600">(optional)</span></label>
                                    <Input
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Who wrote this?"
                                        className="rc-input"
                                    />
                                </div>
                            </div>

                            {/* Storage toggle */}
                            <div className="rc-storage">
                                <div className="rc-storage-header">
                                    <Shield className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-medium">Storage Mode</span>
                                </div>
                                <div className="rc-storage-opts">
                                    <button
                                        className={`rc-storage-opt ${!isEphemeral ? "is-active" : ""}`}
                                        onClick={() => setIsEphemeral(false)}
                                    >
                                        <span className="rc-storage-name">Private</span>
                                        <span className="rc-storage-desc">Saved securely in your account</span>
                                    </button>
                                    <button
                                        className={`rc-storage-opt rc-storage-eph ${isEphemeral ? "is-active" : ""}`}
                                        onClick={() => setIsEphemeral(true)}
                                    >
                                        <span className="rc-storage-name"><Clock className="w-3 h-3 inline mr-1 text-amber-400" />Ephemeral</span>
                                        <span className="rc-storage-desc">Auto-deleted after 24 h</span>
                                    </button>
                                </div>
                            </div>

                            <div className="rc-panel-footer">
                                <Button variant="ghost" onClick={() => setActiveTab("intention")} className="text-gray-500">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <Button disabled={!canProceedToBegin} onClick={() => setActiveTab("begin")} className="rc-btn-next">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 3 · Begin ─────────────────────────────── */}
                    {activeTab === "begin" && selectedMode && (
                        <div className="rc-panel rc-anim">
                            <header className="rc-panel-head">
                                <h1 className="rc-panel-title">Ready to enter the room?</h1>
                                <p className="rc-panel-sub">Review your session, then step inside.</p>
                            </header>

                            {/* Summary card */}
                            <div className="rc-summary">
                                {(() => {
                                    const meta = MODE_META[selectedMode];
                                    const Icon = meta.icon;
                                    return (
                                        <div
                                            className="rc-summary-mode"
                                            style={{ "--mode-accent": meta.accent } as React.CSSProperties}
                                        >
                                            <div className={`rc-summary-icon bg-gradient-to-br ${meta.gradient}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Reading Mode</p>
                                                <p className="font-semibold text-lg" style={{ color: meta.accent }}>
                                                    {READING_MODES[selectedMode].label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="rc-summary-rows">
                                    <div className="rc-summary-row">
                                        <span className="rc-summary-key">Title</span>
                                        <span className="rc-summary-val">{title || "Untitled"}</span>
                                    </div>
                                    {author && (
                                        <div className="rc-summary-row">
                                            <span className="rc-summary-key">Author</span>
                                            <span className="rc-summary-val">{author}</span>
                                        </div>
                                    )}
                                    <div className="rc-summary-row">
                                        <span className="rc-summary-key">Content</span>
                                        <span className="rc-summary-val">
                                            {inputMode === "file" && extractResult
                                                ? `${extractResult.wordCount.toLocaleString()} words · ${extractResult.pageCount}p`
                                                : `${pastedText.split(/\s+/).filter(Boolean).length.toLocaleString()} words`}
                                        </span>
                                    </div>
                                    <div className="rc-summary-row">
                                        <span className="rc-summary-key">Storage</span>
                                        <span className={`rc-summary-val ${isEphemeral ? "text-amber-400" : "text-indigo-400"}`}>
                                            {isEphemeral ? "Ephemeral (24 h)" : "Private"}
                                        </span>
                                    </div>
                                    {moodResult && (
                                        <div className="rc-summary-row">
                                            <span className="rc-summary-key">AI Mood</span>
                                            <span className="rc-summary-val text-amber-400">
                                                <Sparkles className="w-3 h-3 inline mr-1" />
                                                {READING_MODES[moodResult.suggestedMode].label} · {moodResult.confidence}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Legal confirmation */}
                            <button
                                className={`rc-confirm ${confirmed ? "is-confirmed" : ""}`}
                                onClick={() => setConfirmed(!confirmed)}
                            >
                                <span className={`rc-confirm-box ${confirmed ? "is-checked" : ""}`}>
                                    {confirmed && <Check className="w-3 h-3 text-white" />}
                                </span>
                                <span className="rc-confirm-text">
                                    I have the right to use this text. This content is private and will not be shared.
                                </span>
                            </button>

                            {createRead.isError && (
                                <p className="text-sm text-red-400 text-center">
                                    Something went wrong. Please try again.
                                </p>
                            )}

                            <div className="rc-panel-footer">
                                <Button variant="ghost" onClick={() => setActiveTab("content")} className="text-gray-500">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <Button
                                    disabled={!confirmed || createRead.isPending}
                                    onClick={handleSubmit}
                                    size="lg"
                                    className="rc-btn-enter"
                                >
                                    {createRead.isPending ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Preparing…</>
                                    ) : (
                                        <>Enter Reading Room <ArrowRight className="w-4 h-4 ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const RC_STYLES = `
/* ── Shell ──────────────────────────────── */
.rc-shell {
  min-height: 100vh;
  background: #060608;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  color: #e5e7eb;
}

.rc-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
  pointer-events: none;
}
.rc-orb-1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, #6366f1, transparent 70%);
  top: -120px; left: -80px;
}
.rc-orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #8b5cf6, transparent 70%);
  bottom: -80px; right: -60px;
}

/* ── Gate (unauthenticated) ─────────────── */
.rc-gate {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  position: relative;
}
.rc-gate-icon { width: 48px; height: 48px; color: #6b7280; }
.rc-gate-text { color: #9ca3af; }

/* ── Frame ──────────────────────────────── */
.rc-frame {
  display: flex;
  width: 100%;
  max-width: 980px;
  min-height: 580px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px;
  backdrop-filter: blur(24px);
  overflow: hidden;
  position: relative;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* ══ LEFT RAIL ══════════════════════════════ */
.rc-rail {
  width: 220px;
  flex-shrink: 0;
  background: rgba(0,0,0,0.35);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  padding: 28px 0 20px;
}

.rc-rail-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 0 22px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 24px;
}
.rc-rail-logo { width: 20px; height: 20px; color: #818cf8; }
.rc-rail-title { font-size: 14px; font-weight: 600; color: #e5e7eb; letter-spacing: 0.02em; }

.rc-rail-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 12px;
  position: relative;
}

.rc-rail-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  padding: 10px 10px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
  color: #6b7280;
}
.rc-rail-tab:hover:not(.is-locked) { background: rgba(255,255,255,0.04); color: #9ca3af; }
.rc-rail-tab.is-active { background: rgba(99,102,241,0.12); color: #e5e7eb; }
.rc-rail-tab.is-locked { opacity: 0.3; cursor: not-allowed; }
.rc-rail-tab.is-done { color: #a3e635; }

.rc-connector {
  position: absolute;
  left: 22px;
  top: -14px;
  width: 2px;
  height: 14px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  transition: background 0.3s;
}
.rc-connector.is-lit { background: rgba(99,102,241,0.5); }

.rc-rail-dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s;
}
.rc-rail-tab.is-active .rc-rail-dot {
  background: rgba(99,102,241,0.25);
  border-color: rgba(99,102,241,0.6);
  box-shadow: 0 0 12px rgba(99,102,241,0.3);
}
.rc-rail-tab.is-done .rc-rail-dot {
  background: rgba(163,230,53,0.15);
  border-color: rgba(163,230,53,0.5);
}

.rc-dot-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(99,102,241,0.4);
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%,100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 0; transform: scale(1.5); }
}

.rc-rail-labels { flex: 1; }
.rc-rail-label { display: block; font-size: 13px; font-weight: 500; line-height: 1.2; }
.rc-rail-sub { display: block; font-size: 11px; color: #4b5563; margin-top: 1px; }
.rc-rail-tab.is-active .rc-rail-sub { color: #6b7280; }

.rc-rail-arrow { width: 14px; height: 14px; color: #6366f1; flex-shrink: 0; }

.rc-rail-shelf {
  display: flex; align-items: center; gap: 8px;
  margin: 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.rc-rail-shelf:hover { color: #9ca3af; background: rgba(255,255,255,0.04); }

/* ══ MAIN PANEL ════════════════════════════ */
.rc-main {
  flex: 1;
  overflow-y: auto;
  padding: 36px 40px;
}

.rc-panel { display: flex; flex-direction: column; gap: 24px; }
.rc-anim { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rc-panel-head {}
.rc-panel-title { font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
.rc-panel-sub   { font-size: 14px; color: #6b7280; line-height: 1.6; }

/* ── Mode cards ────────────────────────── */
.rc-modes { display: flex; flex-direction: column; gap: 12px; }

.rc-mode-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  text-align: left;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
.rc-mode-card:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.12);
  transform: translateX(3px);
}
.rc-mode-card.is-selected {
  border-color: var(--mode-accent, #6366f1);
  background: rgba(255,255,255,0.04);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 24px -8px var(--mode-accent, #6366f1);
}

.rc-mode-icon-wrap {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.rc-mode-card:hover .rc-mode-icon-wrap { transform: scale(1.08); }

.rc-mode-body { flex: 1; min-width: 0; }
.rc-mode-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.rc-mode-name { font-size: 15px; font-weight: 600; color: #e5e7eb; }
.rc-mode-check { color: var(--mode-accent, #6366f1); }
.rc-mode-desc { font-size: 12px; color: #6b7280; margin-bottom: 3px; }
.rc-mode-tagline { font-size: 11px; color: #4b5563; margin-bottom: 8px; letter-spacing: 0.02em; }
.rc-mode-sample { font-size: 11.5px; color: #374151; font-style: italic; border-left: 2px solid rgba(255,255,255,0.08); padding-left: 10px; margin: 0; line-height: 1.6; }
.rc-mode-card.is-selected .rc-mode-sample { color: #4b5563; border-color: var(--mode-accent, #6366f1); opacity: 0.6; }

.rc-mode-glow {
  position: absolute; inset: 0; border-radius: 16px;
  background: radial-gradient(ellipse at 0% 50%, var(--mode-accent, #6366f1) 0%, transparent 70%);
  opacity: 0.07; pointer-events: none;
}

/* ── Input tabs ────────────────────────── */
.rc-input-tabs {
  display: flex; gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 5px;
}
.rc-input-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 9px 16px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.rc-input-tab:hover { color: #9ca3af; }
.rc-input-tab.is-active {
  background: rgba(99,102,241,0.18);
  color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(99,102,241,0.15);
}

/* ── Content Zone ──────────────────────── */
.rc-content-zone { display: flex; flex-direction: column; gap: 8px; }

.rc-textarea {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 14px !important;
  min-height: 200px;
  font-size: 14px;
  line-height: 1.7;
  color: #d1d5db !important;
  resize: vertical;
  transition: border-color 0.2s;
}
.rc-textarea:focus { border-color: rgba(99,102,241,0.4) !important; outline: none !important; }

.rc-word-count { font-size: 11px; color: #4b5563; text-align: right; }

/* ── Dropzone ──────────────────────────── */
.rc-dropzone {
  border: 2px dashed rgba(255,255,255,0.09);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255,255,255,0.015);
  min-height: 180px;
  display: flex; align-items: center; justify-content: center;
}
.rc-dropzone:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.03); }
.rc-dropzone.is-dragging { border-color: #6366f1; background: rgba(99,102,241,0.08); }
.rc-dropzone.has-file { cursor: default; }

.rc-drop-empty { display: flex; flex-direction: column; align-items: center; }
.rc-extract-progress { display: flex; flex-direction: column; align-items: center; }

.rc-progress-bar {
  height: 3px; width: 140px; background: rgba(255,255,255,0.06);
  border-radius: 99px; overflow: hidden; margin-top: 10px;
}
.rc-progress-fill {
  height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 99px; transition: width 0.3s;
}

.rc-file-card { display: flex; flex-direction: column; align-items: center; }
.rc-file-actions { display: flex; gap: 8px; margin-top: 10px; }
.rc-preview-text {
  margin-top: 14px;
  font-size: 12px; color: #6b7280; line-height: 1.7;
  text-align: left;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 12px 14px;
  max-height: 120px; overflow-y: auto;
  background: rgba(0,0,0,0.2);
  font-style: italic;
}

/* ── Mood Banner ───────────────────────── */
.rc-mood-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(251,191,36,0.2);
  background: rgba(251,191,36,0.05);
  transition: all 0.3s;
  animation: fadeUp 0.4s ease;
}
.rc-mood-banner.is-loading {
  border-color: rgba(99,102,241,0.2);
  background: rgba(99,102,241,0.04);
}

.rc-mood-body { flex: 1; min-width: 0; }
.rc-mood-text { font-size: 13px; color: #e5e7eb; margin-bottom: 3px; }
.rc-mood-mode { font-weight: 700; color: #fbbf24; }
.rc-mood-conf { color: #9ca3af; font-size: 12px; }
.rc-mood-reason { font-size: 12px; color: #6b7280; }

.rc-mood-use {
  padding: 6px 14px; border-radius: 8px;
  background: rgba(251,191,36,0.15);
  border: 1px solid rgba(251,191,36,0.3);
  color: #fbbf24; font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: all 0.2s;
}
.rc-mood-use:hover { background: rgba(251,191,36,0.25); }

.rc-mood-match { font-size: 12px; color: #86efac; white-space: nowrap; }

/* ── Meta grid ─────────────────────────── */
.rc-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 560px) { .rc-meta-grid { grid-template-columns: 1fr; } }

.rc-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.rc-input {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: #d1d5db !important;
  border-radius: 10px !important;
}

/* ── Storage ───────────────────────────── */
.rc-storage {
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px;
  background: rgba(255,255,255,0.02);
}
.rc-storage-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.rc-storage-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rc-storage-opt {
  padding: 12px 14px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  background: transparent; text-align: left; cursor: pointer;
  transition: all 0.2s;
}
.rc-storage-opt.is-active { border-color: #6366f1; background: rgba(99,102,241,0.1); }
.rc-storage-eph.is-active { border-color: #f59e0b; background: rgba(245,158,11,0.1); }
.rc-storage-name { display: block; font-size: 13px; font-weight: 500; color: #d1d5db; margin-bottom: 2px; }
.rc-storage-desc { display: block; font-size: 11px; color: #6b7280; }

/* ── Summary ───────────────────────────── */
.rc-summary {
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px;
  padding: 22px;
  background: rgba(255,255,255,0.02);
  display: flex; flex-direction: column; gap: 16px;
}
.rc-summary-mode {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.rc-summary-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rc-summary-rows { display: flex; flex-direction: column; gap: 10px; }
.rc-summary-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; }
.rc-summary-key { color: #6b7280; }
.rc-summary-val { color: #d1d5db; font-weight: 500; text-align: right; max-width: 60%; overflow: hidden; text-overflow: ellipsis; }

/* ── Confirm ───────────────────────────── */
.rc-confirm {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.07);
  background: transparent;
  cursor: pointer; text-align: left;
  transition: all 0.2s;
}
.rc-confirm:hover { border-color: rgba(255,255,255,0.14); }
.rc-confirm.is-confirmed { border-color: rgba(134,239,172,0.3); background: rgba(134,239,172,0.05); }

.rc-confirm-box {
  width: 20px; height: 20px; border-radius: 6px;
  border: 1.5px solid #4b5563;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
  transition: all 0.2s;
}
.rc-confirm-box.is-checked { background: #22c55e; border-color: #22c55e; }
.rc-confirm-text { font-size: 13px; color: #9ca3af; line-height: 1.6; }

/* ── Footer ────────────────────────────── */
.rc-panel-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-top: auto;
}

.rc-btn-next {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  color: white !important;
  border-radius: 10px !important;
  padding: 0 20px !important;
}
.rc-btn-enter {
  background: linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1) !important;
  border: none !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
  padding: 0 24px !important;
  box-shadow: 0 4px 20px rgba(99,102,241,0.35) !important;
}
.rc-btn-enter:hover:not(:disabled) {
  box-shadow: 0 6px 28px rgba(99,102,241,0.5) !important;
  transform: translateY(-1px);
}

/* ── Responsive ────────────────────────── */
@media (max-width: 680px) {
  .rc-frame { flex-direction: column; min-height: unset; }
  .rc-rail { width: 100%; min-height: unset; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 16px 0; }
  .rc-rail-brand { padding-bottom: 16px; margin-bottom: 0; }
  .rc-rail-nav { flex-direction: row; padding-bottom: 12px; gap: 4px; overflow-x: auto; }
  .rc-rail-sub, .rc-rail-arrow { display: none; }
  .rc-connector { display: none; }
  .rc-rail-shelf { display: none; }
  .rc-main { padding: 24px 20px; }
}
`;

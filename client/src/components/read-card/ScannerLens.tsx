import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { Camera, X, Loader2, Send, Share2, ScanLine, Download, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type LensState = "idle" | "capturing" | "processing" | "result";

interface ScannerLensProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ScannerLens({ isOpen, onClose }: ScannerLensProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const webcamRef = useRef<Webcam>(null);

    const [lensState, setLensState] = useState<LensState>("idle");
    const [extractedText, setExtractedText] = useState<string>("");
    const [selectedText, setSelectedText] = useState<string>("");

    // Start camera
    const handleOpenScanner = () => {
        setLensState("capturing");
        setExtractedText("");
        setSelectedText("");
    };

    // Close modal
    const handleClose = () => {
        setLensState("idle");
        setExtractedText("");
        setSelectedText("");
        onClose();
    };

    // Reset to capture mode
    const handleRetake = () => {
        setLensState("capturing");
        setExtractedText("");
        setSelectedText("");
    };

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        setLensState("processing");

        try {
            const result = await Tesseract.recognize(
                imageSrc,
                'eng',
                { logger: m => console.log(m) }
            );

            const text = result.data.text.trim();
            if (!text) {
                toast({
                    title: "Couldn't read text",
                    description: "Try again with better lighting or closer to the page.",
                    variant: "destructive"
                });
                setLensState("capturing");
                return;
            }

            setExtractedText(text);
            setLensState("result");
        } catch (error) {
            console.error("OCR Error:", error);
            toast({
                title: "Scan Failed",
                description: "An error occurred while deciphering the text.",
                variant: "destructive"
            });
            setLensState("capturing");
        }
    }, [webcamRef, toast]);

    // Handle native text selection
    const handleSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            setSelectedText(selection.toString().trim());
        }
    };

    // Mutations for sharing
    const whisperMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest("POST", "/api/v1/whispers", {
                content,
                type: "quote"
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/whispers"] });
            toast({
                title: "Whispered to the void",
                description: "Your highlighted quote was shared to the feed.",
                style: { background: "rgba(99, 102, 241, 0.95)", color: "white" }
            });
            handleClose();
        }
    });

    const cafeShareMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest("POST", "/api/v1/cafe/public/messages", { content });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/cafe/public/messages"] });
            toast({
                title: "Shared in Café",
                description: "Your quote was pinned to the Midnight Café.",
            });
            handleClose();
        }
    });

    const handleShareToWhispers = () => {
        const textToShare = selectedText || extractedText;
        if (!textToShare) return;
        whisperMutation.mutate(`"${textToShare}"`);
    };

    const handleShareToCafe = () => {
        const textToShare = selectedText || extractedText;
        if (!textToShare) return;
        cafeShareMutation.mutate(`"${textToShare}"`);
    };

    // Save to Vault (Private Diary)
    const vaultMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest("POST", "/api/v1/diaries", {
                content,
                isPublic: false,
                mood: "reflective"
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/diaries"] });
            toast({
                title: "Saved to Vault",
                description: "The quote is now safely stored in your private diary.",
                style: { background: "linear-gradient(to right, #10b981, #059669)", color: "white" }
            });
            handleClose();
        }
    });

    const handleSaveToVault = () => {
        const textToShare = selectedText || extractedText;
        if (!textToShare) return;
        vaultMutation.mutate(`"${textToShare}"\n\n— Scanned from a physical book`);
    };

    // Download to PC as a .txt file
    const handleDownloadToPC = () => {
        const textToShare = selectedText || extractedText;
        if (!textToShare) return;
        const blob = new Blob([`"${textToShare}"\n\n— Scanned using Nocturnal Lens`], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nocturne-scan-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: "Downloaded",
            description: "Quote saved to your device as a text file.",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="absolute top-4 right-4 z-[110]">
                <button
                    onClick={handleClose}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center">

                {/* --- IDLE STATE (Should automatically advance if opened directly to scan) --- */}
                {lensState === "idle" && (
                    <div className="text-center">
                        <ScanLine className="w-16 h-16 text-indigo-400 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-2xl font-bold text-white mb-2">Nocturnal Lens</h2>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                            Scan a physical book to extract a quote and share its light into the night.
                        </p>
                        <button
                            onClick={handleOpenScanner}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Start Scanning
                        </button>
                    </div>
                )}

                {/* --- CAMERA & PROCESSING STATE --- */}
                {(lensState === "capturing" || lensState === "processing") && (
                    <div className="relative w-full max-w-[400px] aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/30">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }}
                            className={`w-full h-full object-cover ${lensState === "processing" ? "opacity-30 grayscale" : "opacity-100"}`}
                        />

                        {/* Viewfinder overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/4 left-8 right-8 bottom-1/4 border-2 border-indigo-400/50 rounded-lg">
                                {/* Corner markers */}
                                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-300" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-300" />
                                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-300" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-300" />
                            </div>
                        </div>

                        {lensState === "processing" ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/40 backdrop-blur-sm z-10">
                                <Loader2 className="w-12 h-12 text-indigo-300 animate-spin mb-4" />
                                <p className="text-indigo-200 font-medium tracking-wider uppercase text-sm">Decoding the ink...</p>
                            </div>
                        ) : (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                                <button
                                    onClick={capture}
                                    className="w-16 h-16 rounded-full bg-white/20 border-4 border-white backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors shadow-lg shadow-black/50"
                                    aria-label="Capture page"
                                >
                                    <Camera className="w-6 h-6 text-white drop-shadow-md" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* --- RESULT & HIGHLIGHT STATE --- */}
                {lensState === "result" && (
                    <div className="w-full max-w-3xl bg-gray-900/80 border border-indigo-500/20 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-xl max-h-[85vh] flex flex-col">
                        <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center gap-2 shrink-0">
                            <ScanLine className="w-5 h-5" />
                            Text Extracted
                        </h3>
                        <p className="text-xs text-gray-500 mb-6 shrink-0 uppercase tracking-wider">
                            Highlight the exact sentence you want to share
                        </p>

                        <div
                            className="bg-black/40 rounded-xl p-5 md:p-8 flex-1 overflow-y-auto mb-6 border border-white/5 font-serif text-gray-300 leading-relaxed text-base md:text-lg selection:bg-indigo-500/40 selection:text-white relative"
                            onMouseUp={handleSelection}
                            onTouchEnd={handleSelection}
                        >
                            {extractedText}
                        </div>

                        <div className="shrink-0 space-y-4">
                            {selectedText && (
                                <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-sm text-indigo-200 italic mb-4">
                                    "{selectedText}"
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                                    <button
                                        disabled={whisperMutation.isPending || !extractedText}
                                        onClick={handleShareToWhispers}
                                        className="flex-1 flex items-center justify-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                                    >
                                        <Send className="w-4 h-4" />
                                        Whisper
                                    </button>

                                    <button
                                        disabled={cafeShareMutation.isPending || !extractedText}
                                        onClick={handleShareToCafe}
                                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20 font-medium"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        To Café
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                                    <button
                                        disabled={vaultMutation.isPending || !extractedText}
                                        onClick={handleSaveToVault}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                                    >
                                        <Bookmark className="w-4 h-4" />
                                        Save in Vault
                                    </button>
                                    <button
                                        disabled={!extractedText}
                                        onClick={handleDownloadToPC}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-black/20 font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Save to PC
                                    </button>
                                </div>

                                <div className="mt-2 text-center w-full">
                                    <button
                                        onClick={handleRetake}
                                        className="px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm w-full max-w-[200px]"
                                    >
                                        Retake scan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

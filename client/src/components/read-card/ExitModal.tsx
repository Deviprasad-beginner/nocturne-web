import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Share2, Trash2, X } from "lucide-react";

interface ExitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKeepPrivate: () => void;
    onShareTonight: () => void;
    onDiscard: () => void;
}

export function ExitModal({
    isOpen,
    onClose,
    onKeepPrivate,
    onShareTonight,
    onDiscard,
}: ExitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-md p-6 bg-gray-900 border-gray-700 relative">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>

                <h2 className="text-2xl font-bold mb-2">Keep this for yourself?</h2>
                <p className="text-gray-400 mb-6">
                    Your progress has been saved. What would you like to do with this read?
                </p>

                <div className="space-y-3">
                    {/* Keep Private */}
                    <button
                        onClick={() => {
                            onKeepPrivate();
                            onClose();
                        }}
                        className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <BookOpen className="w-5 h-5 mt-0.5 text-indigo-400 group-hover:text-indigo-300" />
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">Keep Private (Recommended)</h3>
                                <p className="text-sm text-gray-400">
                                    Save to your bookshelf. Only you can see it.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Share Tonight */}
                    <button
                        onClick={() => {
                            onShareTonight();
                            onClose();
                        }}
                        className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <Share2 className="w-5 h-5 mt-0.5 text-purple-400 group-hover:text-purple-300" />
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">Share with Tonight's Readers</h3>
                                <p className="text-sm text-gray-400">
                                    Anonymous. Others can read along with you. 24h only.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Discard */}
                    <button
                        onClick={() => {
                            if (
                                confirm(
                                    "Are you sure? This will permanently delete this read and all your progress."
                                )
                            ) {
                                onDiscard();
                                onClose();
                            }
                        }}
                        className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-red-500 hover:bg-red-500/10 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <Trash2 className="w-5 h-5 mt-0.5 text-red-400 group-hover:text-red-300" />
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">Discard</h3>
                                <p className="text-sm text-gray-400">
                                    Delete this read and your progress permanently.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 text-center">
                        Your reading progress is always saved automatically
                    </p>
                </div>
            </Card>
        </div>
    );
}

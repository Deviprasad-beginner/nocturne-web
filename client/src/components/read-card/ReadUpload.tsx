import { useState, useCallback } from "react";
import { Upload, FileText, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface ReadUploadProps {
    onUpload: (data: FormData) => void;
    isUploading: boolean;
}

export function ReadUpload({ onUpload, isUploading }: ReadUploadProps) {
    const [mode, setMode] = useState<"file" | "text">("text");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".txt"))) {
            setFile(droppedFile);
            if (!title) {
                setTitle(droppedFile.name.replace(/\.(pdf|txt)$/, ""));
            }
        }
    }, [title]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!title) {
                setTitle(selectedFile.name.replace(/\.(pdf|txt)$/, ""));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title || "Untitled");
        if (author) formData.append("author", author);

        if (mode === "file" && file) {
            formData.append("file", file);
        } else if (mode === "text" && content) {
            formData.append("content", content);
        }

        onUpload(formData);

        // Reset form
        setTitle("");
        setAuthor("");
        setContent("");
        setFile(null);
    };

    const isValid = mode === "file" ? file && title : content.trim() && title;

    return (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    type="button"
                    variant={mode === "text" ? "default" : "outline"}
                    onClick={() => setMode("text")}
                    className="flex-1 gap-2"
                >
                    <Type className="w-4 h-4" />
                    Paste Text
                </Button>
                <Button
                    type="button"
                    variant={mode === "file" ? "default" : "outline"}
                    onClick={() => setMode("file")}
                    className="flex-1 gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Upload File
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Upload Mode */}
                {mode === "file" && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-gray-600 hover:border-gray-500"
                            }
            `}
                    >
                        {file ? (
                            <div className="space-y-2">
                                <FileText className="w-12 h-12 mx-auto text-indigo-400" />
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium mb-1">
                                        Drop PDF or TXT file here
                                    </p>
                                    <p className="text-xs text-gray-400">or click to browse</p>
                                </div>
                                <Input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-input"
                                />
                                <label htmlFor="file-input">
                                    <Button type="button" variant="outline" size="sm" asChild>
                                        <span>Choose File</span>
                                    </Button>
                                </label>
                                <p className="text-xs text-gray-500">Max file size: 10MB</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Text Paste Mode */}
                {mode === "text" && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Content</label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your text here..."
                            className="bg-gray-900/50 border-gray-600 min-h-[300px] font-mono text-sm"
                        />
                    </div>
                )}

                {/* Metadata */}
                <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title..."
                        className="bg-gray-900/50 border-gray-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Author (optional)
                    </label>
                    <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Enter author name..."
                        className="bg-gray-900/50 border-gray-600"
                    />
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={!isValid || isUploading}
                    className="w-full"
                >
                    {isUploading ? "Uploading..." : "Save to Bookshelf"}
                </Button>
            </form>
        </Card>
    );
}

/**
 * Client-side PDF text extraction using PDF.js
 * Extracts plain text from a PDF File object in the browser.
 */

export interface PdfExtractResult {
    text: string;
    pageCount: number;
    wordCount: number;
    estimatedReadMinutes: number;
    preview: string; // first ~300 chars for UI preview
}

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
    if (pdfjsLib) return pdfjsLib;

    // Dynamic import to avoid SSR issues
    pdfjsLib = await import("pdfjs-dist");

    // Point to the bundled worker — Vite will handle this as a URL asset
    const workerUrl = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
    ).href;

    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    return pdfjsLib;
}

export async function extractTextFromPdf(
    file: File,
    onProgress?: (pct: number) => void
): Promise<PdfExtractResult> {
    const pdfjs = await getPdfjs();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    const pageTexts: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ");
        pageTexts.push(pageText);

        if (onProgress) {
            onProgress(Math.round((i / pageCount) * 100));
        }
    }

    const fullText = pageTexts.join("\n\n").replace(/\s+/g, " ").trim();
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const preview = fullText.slice(0, 320) + (fullText.length > 320 ? "…" : "");

    return { text: fullText, pageCount, wordCount, estimatedReadMinutes, preview };
}

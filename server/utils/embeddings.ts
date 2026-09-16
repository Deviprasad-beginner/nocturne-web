// We no longer use @xenova/transformers in Node.js
// Instead, we use the Python FastAPI microservice (see python_service/main.py)

/**
 * Get embedding for a given text using Python FastAPI microservice (all-MiniLM-L6-v2)
 */
export async function getEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim() === '') return [];

    try {
        const response = await fetch('http://127.0.0.1:8000/embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`Python API returned ${response.status}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error('Error generating embedding from Python microservice:', error);
        return [];
    }
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

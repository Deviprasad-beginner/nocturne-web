from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import torch

app = FastAPI(title="Nocturne Embeddings API")

# Load model globally on startup to avoid overhead per request
print("Loading model: all-MiniLM-L6-v2...")
# Using cpu or cuda depending on availability
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = SentenceTransformer('all-MiniLM-L6-v2', device=device)
print(f"Model loaded successfully on {device}!")

class EmbedRequest(BaseModel):
    text: str

class EmbedResponse(BaseModel):
    embedding: list[float]

@app.post("/embed", response_model=EmbedResponse)
async def create_embedding(req: EmbedRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        # Generate embedding
        # encode returns a numpy array, we convert to list
        vector = model.encode(req.text)
        return {"embedding": vector.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

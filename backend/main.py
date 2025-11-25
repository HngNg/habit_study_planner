from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Habit Builder API",
    description="Backend support for the Student Habit Builder PWA",
    version="0.1.0"
)

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Habit Builder API is running", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

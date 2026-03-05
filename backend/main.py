from fastapi import FastAPI
import uvicorn

app = FastAPI(title="MAITRI API")

@app.get("/")
async def root():
    return {"message": "Welcome to MAITRI - Multimodal AI Assistant for Psychological & Physical Well-Being Monitoring"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

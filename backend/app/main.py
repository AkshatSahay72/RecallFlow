from fastapi import FastAPI

app = FastAPI(title="RecallFlow API")

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "RecallFlow"}